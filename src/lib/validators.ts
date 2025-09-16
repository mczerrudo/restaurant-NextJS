import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const upsertMenuItemSchema = z.object({
  restaurantId: z.number().int().positive(),
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  category: z.string().optional(),
  available: z.boolean().default(true),
});

export const createOrderSchema = z.object({
  restaurant: z.number().int().positive(),
  items: z
    .array(
      z.object({
        menu_item: z.number().int().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8),
    fullName: z.string().min(1).optional(),
    isRestaurantOwner: z.coerce.boolean().default(false),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
