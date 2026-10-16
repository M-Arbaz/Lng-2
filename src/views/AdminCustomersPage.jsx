'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Mail,
  MapPin,
  Phone,
  Lock,
  Unlock,
  MessageSquare,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import customersService from '../utils/customersService.js'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
  })
  const [saving, setSaving] = useState(false)
  const [customerOrders, setCustomerOrders] = useState([])

  // Load customers from Firebase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)

        const data = await customersService.getAllCustomers()

        setCustomers(data)
      } catch (e) {
        console.error('Error loading customers:', e)

        setMessage({
          type: 'error',
          text: 'Failed to load customers',
        })
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer)

    try {
      const orders =
        await customersService.getCustomerOrders(customer.id)

      setCustomerOrders(orders)
    } catch (e) {
      console.error('Error loading customer orders:', e)

      setCustomerOrders([])
    }

    setShowDetailModal(true)
  }

  const handleBlockCustomer = async (
    customerId,
    currentStatus
  ) => {
    if (
      window.confirm(
        `Are you sure you want to ${currentStatus ? 'unblock' : 'block'
        } this customer?`
      )
    ) {
      try {
        setSaving(true)

        await customersService.toggleCustomerStatus(
          customerId,
          !currentStatus
        )

        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === customerId
              ? {
                ...customer,
                isBlocked: !currentStatus,
              }
              : customer
          )
        )

        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer({
            ...selectedCustomer,
            isBlocked: !currentStatus,
          })
        }

        setMessage({
          type: 'success',
          text: `Customer ${!currentStatus ? 'blocked' : 'unblocked'
            } successfully!`,
        })
      } catch (error) {
        console.error(
          'Error updating customer status:',
          error
        )

        setMessage({
          type: 'error',
          text: 'Failed to update customer status',
        })
      } finally {
        setSaving(false)
      }

      setTimeout(() => {
        setMessage({
          type: '',
          text: '',
        })
      }, 3000)
    }
  }

  const handleAddTicket = async (e) => {
    e.preventDefault()

    if (
      !ticketForm.subject.trim() ||
      !ticketForm.message.trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Please fill all fields',
      })

      return
    }

    try {
      setSaving(true)

      await customersService.addSupportTicket(
        selectedCustomer.id,
        ticketForm
      )

      const updatedCustomer =
        await customersService.getCustomerById(
          selectedCustomer.id
        )

      setSelectedCustomer(updatedCustomer)

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === updatedCustomer?.id
            ? updatedCustomer
            : customer
        )
      )

      setTicketForm({
        subject: '',
        message: '',
      })

      setShowTicketModal(false)

      setMessage({
        type: 'success',
        text: 'Support ticket created successfully!',
      })
    } catch (error) {
      console.error('Error creating ticket:', error)

      setMessage({
        type: 'error',
        text: 'Failed to create support ticket',
      })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3000)
  }

  const closeDetailsModal = () => {
    setShowDetailModal(false)
    setSelectedCustomer(null)
    setCustomerOrders([])
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()

    return (
      customer.email?.toLowerCase().includes(query) ||
      customer.name?.toLowerCase().includes(query) ||
      customer.displayName?.toLowerCase().includes(query) ||
      customer.firstName?.toLowerCase().includes(query) ||
      customer.lastName?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    )
  })

  const totalSpent = customerOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  )

  const activeCustomers = customers.filter(
    (customer) => !customer.isBlocked
  ).length

  const blockedCustomers = customers.filter(
    (customer) => customer.isBlocked
  ).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC] shadow-sm">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Commerce
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Customer Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage customer accounts, account status,
                  order activity and support conversations.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-[#E7D8CE] bg-[#F7F4EF] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE4DC] text-[#6B4228]">
                <Users className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-medium text-[#8A7467]">
                  Total Customers
                </p>

                <p className="text-lg font-semibold leading-none text-[#3A2117]">
                  {customers.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${message.type === 'success'
              ? 'border-[#CFE1D1] bg-[#F3F9F3] text-[#426649]'
              : 'border-[#E8C9C3] bg-[#FFF4F1] text-[#93483C]'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {message.text}
            </p>
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <p className="text-sm font-medium text-[#8A7467]">
              Total Customers
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold tracking-tight text-[#281912]">
                {customers.length}
              </p>

              <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <p className="text-sm font-medium text-[#8A7467]">
              Active Customers
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold tracking-tight text-[#281912]">
                {activeCustomers}
              </p>

              <div className="rounded-xl border border-[#CFE0D1] bg-[#F3F8F3] p-2.5 text-[#4D7553]">
                <Unlock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <p className="text-sm font-medium text-[#8A7467]">
              Blocked Customers
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold tracking-tight text-[#281912]">
                {blockedCustomers}
              </p>

              <div className="rounded-xl border border-[#E6CBC5] bg-[#FFF3F0] p-2.5 text-[#A35447]">
                <Lock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <div className="shrink-0 text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {filteredCustomers.length}
              </span>{' '}
              of {customers.length}
            </div>
          </div>
        </section>

        {/* Customers */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12">
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading customers...
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE5] text-[#9A7A68]">
                <Users className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-semibold text-[#281912]">
                No customers found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-[#8A7467]">
                {searchQuery
                  ? 'Try changing your search query.'
                  : 'Registered customers will appear here.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-[#E8DDD5] bg-[#F7F4EF]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Orders
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEE5DF]">
                    {filteredCustomers.map((customer) => {
                      const custOrders =
                        customerOrders.filter(
                          (order) =>
                            order.userId === customer.id
                        )

                      return (
                        <tr
                          key={customer.id}
                          className="transition-colors hover:bg-[#FBF8F4]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEE5DE] text-sm font-semibold uppercase text-[#6B4228]">
                                {(
                                  customer.displayName ||
                                  customer.firstName ||
                                  customer.email ||
                                  'C'
                                ).charAt(0)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#281912]">
                                  {customer.displayName ||
                                    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
                                    'N/A'}
                                </p>

                                <p className="mt-0.5 text-xs text-[#99867B]">
                                  {customer.createdAt
                                    ? new Date(
                                      customer.createdAt
                                    ).toLocaleDateString()
                                    : 'Date unavailable'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm text-[#5F5048]">
                                <Mail className="h-3.5 w-3.5 shrink-0 text-[#9A8478]" />

                                <span className="max-w-[250px] truncate">
                                  {customer.email ||
                                    'N/A'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-[#7B685D]">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-[#9A8478]" />

                                <span>
                                  {customer.phone ||
                                    'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex rounded-full border border-[#DED1C8] bg-[#F7F4EF] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                              {custOrders.length} orders
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${customer.isBlocked
                                ? 'border-[#E4C4BE] bg-[#FFF2EF] text-[#9B4C40]'
                                : 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                                }`}
                            >
                              {customer.isBlocked
                                ? 'Blocked'
                                : 'Active'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDetails(
                                    customer
                                  )
                                }
                                className="rounded-lg border border-[#D7C7BC] bg-[#FFFEFC] px-3.5 py-2 text-xs font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
                              >
                                Details
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleBlockCustomer(
                                    customer.id,
                                    customer.isBlocked
                                  )
                                }
                                disabled={saving}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${customer.isBlocked
                                  ? 'bg-[#3A2117] text-[#FFFEFC] hover:bg-[#281912]'
                                  : 'border border-[#E0C1BB] bg-[#FFF7F5] text-[#944B40] hover:bg-[#FCEBE7]'
                                  }`}
                              >
                                {customer.isBlocked ? (
                                  <Unlock className="h-3.5 w-3.5" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5" />
                                )}

                                {customer.isBlocked
                                  ? 'Unblock'
                                  : 'Block'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-[#EEE5DF] lg:hidden">
                {filteredCustomers.map((customer) => {
                  const custOrders =
                    customerOrders.filter(
                      (order) =>
                        order.userId === customer.id
                    )

                  return (
                    <article
                      key={customer.id}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEE5DE] font-semibold uppercase text-[#6B4228]">
                          {(
                            customer.displayName ||
                            customer.firstName ||
                            customer.email ||
                            'C'
                          ).charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-[#281912]">
                                {customer.name ||
                                  'N/A'}
                              </h3>

                              <p className="mt-0.5 break-all text-xs text-[#8A7467]">
                                {customer.email ||
                                  'N/A'}
                              </p>
                            </div>

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${customer.isBlocked
                                ? 'border-[#E4C4BE] bg-[#FFF2EF] text-[#9B4C40]'
                                : 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                                }`}
                            >
                              {customer.isBlocked
                                ? 'Blocked'
                                : 'Active'}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-[#F7F4EF] p-3">
                              <p className="text-[11px] uppercase tracking-wide text-[#9A8478]">
                                Phone
                              </p>

                              <p className="mt-1 truncate font-medium text-[#5F5048]">
                                {customer.phone ||
                                  'N/A'}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#F7F4EF] p-3">
                              <p className="text-[11px] uppercase tracking-wide text-[#9A8478]">
                                Orders
                              </p>

                              <p className="mt-1 font-medium text-[#5F5048]">
                                {custOrders.length}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  customer
                                )
                              }
                              className="flex-1 rounded-lg bg-[#3A2117] px-3 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleBlockCustomer(
                                  customer.id,
                                  customer.isBlocked
                                )
                              }
                              disabled={saving}
                              className="rounded-lg border border-[#D8C9BF] px-3 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                              aria-label={
                                customer.isBlocked
                                  ? 'Unblock customer'
                                  : 'Block customer'
                              }
                            >
                              {customer.isBlocked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Customer Details Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281912]/55 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.28)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <Users className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-[#281912] sm:text-xl">
                      Customer Details
                    </h3>

                    <p className="truncate text-xs text-[#8A7467]">
                      {selectedCustomer.email ||
                        'Customer account'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117]"
                  aria-label="Close customer details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
              <div className="space-y-5">
                {/* Personal Info */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                        Account
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                        Personal Information
                      </h4>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${selectedCustomer.isBlocked
                        ? 'border-[#E4C4BE] bg-[#FFF2EF] text-[#9B4C40]'
                        : 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                        }`}
                    >
                      {selectedCustomer.isBlocked
                        ? 'Blocked'
                        : 'Active'}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#F8F5F1] p-4">
                      <p className="text-xs font-medium text-[#99867B]">
                        Name
                      </p>

                      <p className="mt-1.5 break-words text-sm font-semibold text-[#281912]">
                        {selectedCustomer.displayName ||
                          `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() ||
                          'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F5F1] p-4">
                      <p className="text-xs font-medium text-[#99867B]">
                        Email
                      </p>

                      <p className="mt-1.5 break-all text-sm font-semibold text-[#281912]">
                        {selectedCustomer.email ||
                          'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F5F1] p-4">
                      <p className="text-xs font-medium text-[#99867B]">
                        Phone
                      </p>

                      <p className="mt-1.5 text-sm font-semibold text-[#281912]">
                        {selectedCustomer.phone ||
                          'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F5F1] p-4">
                      <p className="text-xs font-medium text-[#99867B]">
                        Customer ID
                      </p>

                      <p className="mt-1.5 break-all text-sm font-semibold text-[#281912]">
                        {selectedCustomer.id}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Address */}
                {selectedCustomer.address && (
                  <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                    <h4 className="text-lg font-semibold text-[#281912]">
                      Address
                    </h4>

                    <div className="mt-4 flex gap-3 rounded-xl bg-[#F8F5F1] p-4">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#6B4228]" />

                      <p className="text-sm leading-6 text-[#5F5048]">
                        {selectedCustomer.address}
                      </p>
                    </div>
                  </section>
                )}

                {/* Orders */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Commerce
                    </p>

                    <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                      Order History
                    </h4>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-dashed border-[#DACCC2] bg-[#FAF7F3] px-4 py-8 text-center">
                      <p className="text-sm font-medium text-[#7B685D]">
                        No orders yet
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
                          <p className="text-xs text-[#8A7467]">
                            Total Orders
                          </p>

                          <p className="mt-1 text-2xl font-semibold text-[#3A2117]">
                            {customerOrders.length}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
                          <p className="text-xs text-[#8A7467]">
                            Total Spent
                          </p>

                          <p className="mt-1 text-xl font-semibold text-[#3A2117]">
                            Rs.{' '}
                            {totalSpent.toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
                          <p className="text-xs text-[#8A7467]">
                            Avg. Order
                          </p>

                          <p className="mt-1 text-xl font-semibold text-[#3A2117]">
                            Rs.{' '}
                            {Math.round(
                              totalSpent /
                              customerOrders.length
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {customerOrders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-[#E8DDD5] bg-[#FFFEFC] p-4 transition hover:border-[#CDBCAF] hover:shadow-sm"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-[#281912]">
                                  Order #
                                  {order.id?.substring(
                                    0,
                                    8
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-[#8A7467]">
                                  {order.createdAt
                                    ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${order.status ===
                                  'delivered'
                                  ? 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                                  : order.status ===
                                    'shipped'
                                    ? 'border-[#C9D7E1] bg-[#F2F7FA] text-[#496B80]'
                                    : 'border-[#E4D6B6] bg-[#FFF9EA] text-[#866A28]'
                                  }`}
                              >
                                {order.status ||
                                  'Pending'}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-3 text-sm">
                              <span className="text-[#7B685D]">
                                {order.items?.length ||
                                  0}{' '}
                                items
                              </span>

                              <span className="font-semibold text-[#3A2117]">
                                Rs.{' '}
                                {(
                                  order.total || 0
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Support Tickets */}
                {selectedCustomer.supportTickets &&
                  selectedCustomer.supportTickets
                    .length > 0 && (
                    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                          Support
                        </p>

                        <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                          Support Tickets
                        </h4>
                      </div>

                      <div className="mt-5 space-y-3">
                        {selectedCustomer.supportTickets.map(
                          (ticket) => (
                            <div
                              key={ticket.id}
                              className="rounded-xl border border-[#E8DDD5] p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <p className="font-semibold text-[#281912]">
                                  {ticket.subject}
                                </p>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ticket.status ===
                                    'resolved'
                                    ? 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                                    : 'border-[#E4D6B6] bg-[#FFF9EA] text-[#866A28]'
                                    }`}
                                >
                                  {ticket.status}
                                </span>
                              </div>

                              <p className="mt-3 text-sm leading-6 text-[#66564D]">
                                {ticket.message}
                              </p>

                              {ticket.response && (
                                <div className="mt-3 rounded-lg border border-[#DED1C8] bg-[#F7F4EF] p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B4228]">
                                    Admin Response
                                  </p>

                                  <p className="mt-1.5 text-sm text-[#5F5048]">
                                    {
                                      ticket.response
                                    }
                                  </p>
                                </div>
                              )}

                              <p className="mt-3 text-xs text-[#99867B]">
                                {new Date(
                                  ticket.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                >
                  Close
                </button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      handleBlockCustomer(
                        selectedCustomer.id,
                        selectedCustomer.isBlocked
                      )
                    }
                    disabled={saving}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedCustomer.isBlocked
                      ? 'border border-[#D3C4BA] bg-[#F7F4EF] text-[#6B4228] hover:bg-[#EFE6DF]'
                      : 'border border-[#E1C2BC] bg-[#FFF4F1] text-[#93483C] hover:bg-[#FBE9E5]'
                      }`}
                  >
                    {selectedCustomer.isBlocked ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}

                    {selectedCustomer.isBlocked
                      ? 'Unblock Customer'
                      : 'Block Customer'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowTicketModal(true)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Support Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showTicketModal && selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <form
            onSubmit={handleAddTicket}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.3)]"
          >
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#281912]">
                      Add Support Ticket
                    </h3>

                    <p className="text-xs text-[#8A7467]">
                      {selectedCustomer.displayName ||
                        `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() ||
                        selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowTicketModal(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117]"
                  aria-label="Close ticket modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/60 p-5 sm:p-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter ticket subject"
                    className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                    Message
                  </label>

                  <textarea
                    value={ticketForm.message}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write message for customer..."
                    rows={6}
                    className="w-full resize-none rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm leading-6 text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowTicketModal(false)
                  }
                  className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Create Ticket
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}