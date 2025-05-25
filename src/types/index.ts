export * from './Post';
export * from './Category';
export * from './User';
export * from './Upload';
export * from './mappers';

// Generic option type for selects
export type SelectOption<T = string> = { label: string; value: T; count?: number }; 