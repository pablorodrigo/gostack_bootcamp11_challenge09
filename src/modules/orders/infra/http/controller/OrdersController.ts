import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';
import { classToClass } from 'class-transformer';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const order_id = request.params.id;

    const showOrder = container.resolve(FindOrderService);

    const order = await showOrder.execute({ id: order_id });

    return response.json(order);
    /* return response.json({
      customer: classToClass(order?.customer),
      order_products: classToClass(order?.order_products),
    }); */
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const createOrders = container.resolve(CreateOrderService);

    const order = await createOrders.execute({
      customer_id,
      products,
    });

    return response.json(order);
  }
}
