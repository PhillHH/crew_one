import { z } from 'zod';

export const diyFormSchema = z.object({
  projectDescription: z.string()
    .min(20, 'Bitte beschreibe dein Projekt ausführlicher (mindestens 20 Zeichen)')
    .max(2000, 'Beschreibung zu lang (maximal 2000 Zeichen)'),

  experienceLevel: z.enum(['beginner', 'experienced', 'professional'], {
    required_error: 'Bitte wähle dein Erfahrungslevel',
  }),

  deliveryDownload: z.boolean(),
  deliveryEmail: z.boolean(),

  phoneSupport: z.boolean(),
  onsiteSupport: z.boolean(),
  location: z.string().optional(),

  name: z.string()
    .trim()
    .min(2, 'Name zu kurz')
    .max(100, 'Name zu lang'),

  email: z.string()
    .trim()
    .email('Ungültige E-Mail-Adresse'),

  phone: z.string()
    .trim()
    .refine((value) => {
      const normalized = value
        .replace(/\s+/g, '')
        .replace(/[-()]/g, '');
      return /^(\+?49|0049|0)[1-9]\d{6,}$/.test(normalized);
    }, 'Ungültige Telefonnummer (verwende z.B. +49 160 1234567)'),
}).refine(
  (data) => data.deliveryDownload || data.deliveryEmail,
  {
    message: 'Bitte wähle mindestens eine Lieferoption',
    path: ['deliveryDownload'],
  }
).refine(
  (data) => !data.onsiteSupport || data.location,
  {
    message: 'Standort ist erforderlich für Vor-Ort-Support',
    path: ['location'],
  }
);

export const transformFormData = (formData) => {
  return {
    project_description: formData.projectDescription,
    experience_level: formData.experienceLevel,
    delivery_options: {
      download: formData.deliveryDownload,
      email: formData.deliveryEmail,
    },
    support_options: (formData.phoneSupport || formData.onsiteSupport) ? {
      phone_support: formData.phoneSupport,
      onsite_support: formData.onsiteSupport,
      location: formData.location || null,
    } : null,
    contact: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    },
  };
};

