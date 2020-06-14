import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not exist');
    }

    const allProductsDataById = await this.productsRepository.findAllById(
      products,
    );

    if (allProductsDataById.length !== products.length)
      throw new AppError('One or more of the specified products do not exist');

    const [{ quantity: newQuantity }] = products;
    const [{ quantity }] = allProductsDataById;

    if (quantity < newQuantity) {
      throw new AppError(
        'You are requesting more quantity that we current have',
        400,
      );
    }

    if (!allProductsDataById) {
      throw new AppError('This product does not exists!', 400);
    }

    // change quantity
    for (let i = 0; i < allProductsDataById.length; i += 1) {
      allProductsDataById[i].quantity = products[i].quantity;
    }

    const order = await this.ordersRepository.create({
      customer,
      products: allProductsDataById.map(product => {
        return {
          price: product.price,
          product_id: product.id,
          quantity: product.quantity,
        };
      }),
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
