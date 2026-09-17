const customersData = require('../data/customers.json');
const bookingsData = require('../data/bookings.json');

function getCustomerById(customerId) {
  return customersData.customers.find((c) => c.id === customerId) || null;
}

function getBookingsByCustomerId(customerId) {
  return bookingsData.bookings.filter((b) => b.customerId === customerId);
}

/**
 * Returns the primary disrupted booking for a customer
 * (cancelled or delayed takes priority over unaffected)
 */
function getPrimaryBooking(customerId) {
  const all = getBookingsByCustomerId(customerId);
  const disrupted = all.find((b) => b.status === 'Cancelled' || b.status === 'Delayed');
  return disrupted || all[0] || null;
}

function getAllCustomers() {
  return customersData.customers;
}

module.exports = {
  getCustomerById,
  getBookingsByCustomerId,
  getPrimaryBooking,
  getAllCustomers,
};
