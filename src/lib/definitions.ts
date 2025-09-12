// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type MenuItemType = {
  id: number;
  restaurant: number;
  restaurant_name: string;
  name: string;
  price: string; // as returned by DRF
  description: string;
  category: string;
  available: boolean;
};
