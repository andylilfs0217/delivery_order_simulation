import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface CreateOrderInput {
  origin: [string, string];
  destination: [string, string];
}

export interface OrderDto {
  id?: number;
  distance?: number;
  status?: string;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  distance: number;

  @Column()
  status: string;
}
