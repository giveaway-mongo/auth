export { User as UserEvent } from '@protogen/broker/user/user';
export { Deal as DealEvent } from '@protogen/broker/deal/deal';
export { Category as CategoryEvent } from '@protogen/broker/category/category';

export type UserServiceRMQEventNamePattern = `user.user.${string}`;

export const USER_SERVICE_BROKER_EVENTS = {
  USER_CREATED: 'user.user.add',
  USER_UPDATED: 'user.user.update',
  USER_DELETED: 'user.user.delete',
} satisfies Record<string, UserServiceRMQEventNamePattern>;

export type DealServiceRMQEventNamePattern = `deal.deal.${string}`;

export const DEALS_SERVICE_BROKER_EVENTS = {
  DEAL_CREATED: 'deal.deal.add',
  DEAL_UPDATED: 'deal.deal.change',
} satisfies Record<string, DealServiceRMQEventNamePattern>;

export type CategoriesServiceRMQEventNamePattern =
  `category.category.${string}`;

export const CATEGORIES_SERVICE_BROKER_EVENTS = {
  CATEGORY_CREATED: 'category.category.add',
  CATEGORY_UPDATED: 'category.category.update',
  CATEGORY_DELETED: 'category.category.delete',
} satisfies Record<string, CategoriesServiceRMQEventNamePattern>;
