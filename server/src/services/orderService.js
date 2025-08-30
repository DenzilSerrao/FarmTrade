// services/orderService.js
class OrderService {
  constructor() {
    this.orders = []; // Mock in-memory storage
    this.currentId = 1;
  }

  async getOrders() {
    return this.orders;
  }

  async createOrder(order) {
    order.id = this.currentId++;
    this.orders.push(order);
    return order;
  }
}

module.exports = OrderService;
