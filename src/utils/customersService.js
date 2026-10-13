import { collection, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const customersService = {
  // Get all customers (users from Firestore)
  async getAllCustomers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const customers = []
      querySnapshot.forEach((doc) => {
        customers.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      return customers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  },

  // Get customer by ID
  async getCustomerById(customerId) {
    try {
      const docRef = doc(db, 'users', customerId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  },

  // Get customer orders
  async getCustomerOrders(customerId) {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', customerId))
      const querySnapshot = await getDocs(q)
      const orders = []
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      return orders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      return []
    }
  },

  // Block/Unblock customer
  async toggleCustomerStatus(customerId, isBlocked) {
    try {
      const docRef = doc(db, 'users', customerId)
      await updateDoc(docRef, {
        isBlocked,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error updating customer status:', error)
      throw error
    }
  },

  // Add support ticket/message
  async addSupportTicket(customerId, ticket) {
    try {
      // Store tickets in the customer document
      const docRef = doc(db, 'users', customerId)
      const docSnap = await getDoc(docRef)
      const currentTickets = docSnap.data()?.supportTickets || []
      
      const newTicket = {
        id: Date.now().toString(),
        subject: ticket.subject,
        message: ticket.message,
        status: 'open',
        createdAt: new Date().toISOString(),
        response: '',
      }
      
      await updateDoc(docRef, {
        supportTickets: [...currentTickets, newTicket],
      })
      return newTicket
    } catch (error) {
      console.error('Error adding support ticket:', error)
      throw error
    }
  },

  // Update support ticket response
  async respondToTicket(customerId, ticketId, response) {
    try {
      const docRef = doc(db, 'users', customerId)
      const docSnap = await getDoc(docRef)
      const tickets = docSnap.data()?.supportTickets || []
      
      const updatedTickets = tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              response,
              status: 'resolved',
              respondedAt: new Date().toISOString(),
            }
          : t
      )
      
      await updateDoc(docRef, {
        supportTickets: updatedTickets,
      })
      return true
    } catch (error) {
      console.error('Error responding to ticket:', error)
      throw error
    }
  },
}

export default customersService
