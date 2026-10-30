import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  runTransaction,
} from 'firebase/firestore';
const PAYMENT_STATUS_LABELS = {
  pending: 'Payment Pending',
  partial: 'Partially Paid',
  paid: 'Payment Paid',
  failed: 'Payment Failed',
  refunded: 'Payment Refunded',
  cancelled: 'Payment Cancelled',
};

const normalizePaymentStatus = (value) => {
  const normalized = String(value || 'pending')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return PAYMENT_STATUS_LABELS[normalized]
    ? normalized
    : 'pending';
};
const INVENTORY_RELEASE_STATUSES =
  new Set([
    'cancelled',
    'canceled',
    'returned',
  ]);

const normalizeOrderStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const getOrderProductQuantities = (
  items = []
) => {
  const quantities = new Map();

  if (!Array.isArray(items)) {
    return quantities;
  }

  items.forEach((item) => {
    const productId = String(
      item?.productId || ''
    ).trim();

    const quantity =
      Number.parseInt(
        item?.quantity,
        10
      );

    if (
      !productId ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return;
    }

    quantities.set(
      productId,
      (quantities.get(
        productId
      ) || 0) + quantity
    );
  });

  return quantities;
};
export const ordersService = {
  // Create a new order
  // Create a new order + reserve product stock atomically
  createOrder: async (userId, orderData) => {
    try {
      const createdAtIso =
        new Date().toISOString();

      const initialPaymentStatus =
        normalizePaymentStatus(
          orderData?.paymentStatus
        );

      const items = Array.isArray(
        orderData?.items
      )
        ? orderData.items
        : [];

      if (items.length === 0) {
        throw new Error(
          'Cannot place an order with no products.'
        );
      }

      /*
       * Same product can exist in multiple cart lines
       * because of Base Color / Shade / Bulb variants.
       *
       * Example:
       * Product A - Black = qty 1
       * Product A - Brown = qty 2
       *
       * Actual stock reduction must be 3.
       */
      const requestedByProduct =
        new Map();

      items.forEach((item) => {
        const productId = String(
          item?.productId || ''
        ).trim();

        const quantity =
          Number.parseInt(
            item?.quantity,
            10
          );

        if (
          !productId ||
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            'Invalid product information in order.'
          );
        }

        requestedByProduct.set(
          productId,
          (requestedByProduct.get(
            productId
          ) || 0) + quantity
        );
      });

      // Generate order ID before the transaction.
      const orderRef = doc(
        collection(db, 'orders')
      );

      await runTransaction(
        db,
        async (transaction) => {
          /*
           * Firestore transactions require reads
           * before writes.
           */
          const productEntries = [];

          for (const [
            productId,
            quantity,
          ] of requestedByProduct.entries()) {
            const productRef = doc(
              db,
              'products',
              productId
            );

            const productSnapshot =
              await transaction.get(
                productRef
              );

            if (
              !productSnapshot.exists()
            ) {
              throw new Error(
                'One of the products in your cart is no longer available.'
              );
            }

            const productData =
              productSnapshot.data();

            const currentStock = Number(
              productData?.stock || 0
            );

            if (
              !Number.isFinite(
                currentStock
              ) ||
              currentStock < quantity
            ) {
              const productName =
                productData?.name ||
                'Product';

              throw new Error(
                `${productName} only has ${Math.max(
                  0,
                  currentStock
                )} item(s) left in stock.`
              );
            }

            productEntries.push({
              ref: productRef,
              currentStock,
              quantity,
            });
          }

          /*
           * All stock checks passed.
           * Now reduce inventory.
           */
          productEntries.forEach(
            ({
              ref,
              currentStock,
              quantity,
            }) => {
              transaction.update(
                ref,
                {
                  stock:
                    currentStock -
                    quantity,

                  updatedAt:
                    serverTimestamp(),
                }
              );
            }
          );

          /*
           * Order is created in the SAME
           * transaction as stock reduction.
           *
           * Either everything succeeds,
           * or nothing is written.
           */
          transaction.set(
            orderRef,
            {
              userId,
              ...orderData,

              status: 'pending',

              statusHistory: [
                {
                  status: 'pending',
                  label:
                    'Order Placed',
                  at: createdAtIso,
                  source: 'system',
                },
              ],

              paymentStatus:
                initialPaymentStatus,

              paymentStatusHistory: [
                {
                  status:
                    initialPaymentStatus,

                  label:
                    PAYMENT_STATUS_LABELS[
                    initialPaymentStatus
                    ],

                  at: createdAtIso,
                  source: 'system',
                },
              ],
              inventoryAdjusted: true,

              inventoryAdjustedAt:
                serverTimestamp(),

              inventoryRestored: false,
              createdAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      return {
        id: orderRef.id,
        userId,
        ...orderData,

        status: 'pending',

        paymentStatus:
          initialPaymentStatus,

        inventoryAdjusted: true,
      };
    } catch (error) {
      console.error(
        'Error creating order:',
        error
      );

      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async (userId) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  },
  // Listen to user's orders in real time
  subscribeToUserOrders: (userId, onChange, onError) => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const orders = querySnapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
        }));

        onChange(orders);
      },
      (error) => {
        console.error('Error listening to user orders:', error);

        if (onError) {
          onError(error);
        }
      }
    );
  },
  // Get all orders (for admin)
  getAllOrders: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Update order status
  // Update order status + keep inventory in sync
  updateOrderStatus: async (
    orderId,
    status,
    source = 'admin'
  ) => {
    try {
      const orderRef = doc(
        db,
        'orders',
        orderId
      );

      const statusLabels = {
        pending: 'Order Placed',
        confirmed: 'Order Confirmed',
        approved: 'Order Approved',
        processing: 'Order Processing',
        in_production:
          'Order in Production',
        production:
          'Order in Production',
        ready: 'Order Ready',
        dispatched:
          'Order Dispatched',
        shipped: 'Order Shipped',
        out_for_delivery:
          'Out for Delivery',
        delivered: 'Order Delivered',
        cancelled: 'Order Cancelled',
        canceled: 'Order Cancelled',
        returned: 'Order Returned',
      };

      const normalizedStatus =
        normalizeOrderStatus(status);

      const label =
        statusLabels[
        normalizedStatus
        ] ||
        normalizedStatus
          .replace(/_/g, ' ')
          .replace(
            /\b\w/g,
            (char) =>
              char.toUpperCase()
          );

      const statusEvent = {
        status:
          normalizedStatus,
        label,
        at: new Date().toISOString(),
        source,
      };

      let inventoryRestored = null;

      await runTransaction(
        db,
        async (transaction) => {
          /*
           * First read order.
           */
          const orderSnapshot =
            await transaction.get(
              orderRef
            );

          if (
            !orderSnapshot.exists()
          ) {
            throw new Error(
              'Order not found.'
            );
          }

          const orderData =
            orderSnapshot.data();

          const inventoryWasAdjusted =
            orderData
              ?.inventoryAdjusted ===
            true;

          const inventoryIsRestored =
            orderData
              ?.inventoryRestored ===
            true;

          const releasingInventory =
            INVENTORY_RELEASE_STATUSES.has(
              normalizedStatus
            );

          /*
           * We only touch stock for orders
           * whose stock was originally
           * deducted by our inventory system.
           *
           * This prevents old orders from
           * accidentally increasing stock.
           */
          const shouldRestore =
            inventoryWasAdjusted &&
            releasingInventory &&
            !inventoryIsRestored;

          /*
           * If admin reopens an order after
           * cancellation/return, reserve the
           * stock again.
           */
          const shouldReserveAgain =
            inventoryWasAdjusted &&
            !releasingInventory &&
            inventoryIsRestored;

          const requestedByProduct =
            getOrderProductQuantities(
              orderData?.items
            );

          const productEntries = [];

          if (
            shouldRestore ||
            shouldReserveAgain
          ) {
            /*
             * Firestore requires transaction
             * reads before writes.
             */
            for (const [
              productId,
              quantity,
            ] of requestedByProduct.entries()) {
              const productRef =
                doc(
                  db,
                  'products',
                  productId
                );

              const productSnapshot =
                await transaction.get(
                  productRef
                );

              /*
               * Product may have been deleted
               * after the order was placed.
               * Nothing can be restored to a
               * deleted product document.
               */
              if (
                !productSnapshot.exists()
              ) {
                continue;
              }

              const productData =
                productSnapshot.data();

              const currentStock =
                Math.max(
                  0,
                  Number(
                    productData
                      ?.stock || 0
                  )
                );

              /*
               * Reopening a cancelled order
               * must not create negative stock.
               */
              if (
                shouldReserveAgain &&
                currentStock <
                quantity
              ) {
                throw new Error(
                  `${productData
                    ?.name ||
                  'Product'
                  } only has ${currentStock} item(s) left in stock. The order cannot be reopened.`
                );
              }

              productEntries.push({
                ref: productRef,
                currentStock,
                quantity,
              });
            }
          }

          /*
           * All reads completed.
           * Now inventory writes.
           */
          if (shouldRestore) {
            productEntries.forEach(
              ({
                ref,
                currentStock,
                quantity,
              }) => {
                transaction.update(
                  ref,
                  {
                    stock:
                      currentStock +
                      quantity,

                    updatedAt:
                      serverTimestamp(),
                  }
                );
              }
            );

            inventoryRestored =
              true;
          }

          if (
            shouldReserveAgain
          ) {
            productEntries.forEach(
              ({
                ref,
                currentStock,
                quantity,
              }) => {
                transaction.update(
                  ref,
                  {
                    stock:
                      currentStock -
                      quantity,

                    updatedAt:
                      serverTimestamp(),
                  }
                );
              }
            );

            inventoryRestored =
              false;
          }

          const orderUpdate = {
            status:
              normalizedStatus,

            statusHistory:
              arrayUnion(
                statusEvent
              ),

            updatedAt:
              serverTimestamp(),
          };

          if (shouldRestore) {
            orderUpdate.inventoryRestored =
              true;

            orderUpdate.inventoryRestoredAt =
              serverTimestamp();
          }

          if (
            shouldReserveAgain
          ) {
            orderUpdate.inventoryRestored =
              false;

            orderUpdate.inventoryReReservedAt =
              serverTimestamp();
          }

          transaction.update(
            orderRef,
            orderUpdate
          );
        }
      );

      return {
        id: orderId,
        status:
          normalizedStatus,
        statusEvent,
        ...(inventoryRestored !==
          null
          ? {
            inventoryRestored,
          }
          : {}),
      };
    } catch (error) {
      console.error(
        'Error updating order status:',
        error
      );

      throw error;
    }
  },
  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);

      const normalizedStatus =
        normalizePaymentStatus(paymentStatus);

      const paymentStatusEvent = {
        status: normalizedStatus,
        label:
          PAYMENT_STATUS_LABELS[
          normalizedStatus
          ],
        at: new Date().toISOString(),
        source: 'admin',
      };

      await updateDoc(docRef, {
        paymentStatus: normalizedStatus,

        paymentStatusHistory: arrayUnion(
          paymentStatusEvent
        ),

        updatedAt: serverTimestamp(),
      });

      return {
        id: orderId,
        paymentStatus: normalizedStatus,
        paymentStatusEvent,
      };
    } catch (error) {
      console.error(
        'Error updating payment status:',
        error
      );

      throw error;
    }
  },
  // Update order tracking details
  updateOrderTracking: async (orderId, tracking) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        tracking: {
          ...tracking,
          addedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      });
      return { id: orderId, tracking };
    } catch (error) {
      console.error('Error updating order tracking:', error);
      throw error;
    }
  },

  // Permanently delete an order and restore reserved stock when applicable.
  deleteOrder: async (orderId) => {
    const normalizedId = String(orderId || '').trim();

    if (!normalizedId) {
      throw new Error('Invalid order ID.');
    }

    try {
      const orderRef = doc(db, 'orders', normalizedId);

      let inventoryRestored = false;

      await runTransaction(db, async (transaction) => {
        const orderSnapshot = await transaction.get(orderRef);

        if (!orderSnapshot.exists()) {
          throw new Error('Order not found.');
        }

        const orderData = orderSnapshot.data();

        const currentStatus = normalizeOrderStatus(
          orderData?.status
        );

        // Never restock orders that have already been fulfilled or shipped.
        const fulfilledStatuses = new Set([
          'delivered',
          'shipped',
          'dispatched',
          'out_for_delivery',
        ]);

        const shouldRestoreInventory =
          orderData?.inventoryAdjusted === true &&
          orderData?.inventoryRestored !== true &&
          !fulfilledStatuses.has(currentStatus);

        const productEntries = [];

        // Read every product before writing anything in the transaction.
        if (shouldRestoreInventory) {
          const quantities = getOrderProductQuantities(
            orderData?.items
          );

          for (const [productId, quantity] of quantities.entries()) {
            const productRef = doc(
              db,
              'products',
              productId
            );

            const productSnapshot = await transaction.get(
              productRef
            );

            // A product may have been removed after the order was placed.
            if (!productSnapshot.exists()) {
              continue;
            }

            const productData = productSnapshot.data();
            const currentStock = Number(productData?.stock || 0);

            productEntries.push({
              ref: productRef,
              stock: Number.isFinite(currentStock)
                ? Math.max(0, currentStock)
                : 0,
              quantity,
            });
          }
        }

        // Restore stock only for inventory-managed orders.
        productEntries.forEach(({ ref, stock, quantity }) => {
          transaction.update(ref, {
            stock: stock + quantity,
            updatedAt: serverTimestamp(),
          });
        });

        inventoryRestored = shouldRestoreInventory;

        // Delete the order in the same transaction.
        transaction.delete(orderRef);
      });

      return {
        id: normalizedId,
        inventoryRestored,
      };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    return ordersService.updateOrderStatus(
      orderId,
      'cancelled',
      'system'
    );
  },
};

export default ordersService;
