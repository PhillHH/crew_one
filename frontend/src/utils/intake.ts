import { DIYRequirement } from '../types/intake';

export function formatRequirementSummary(requirement: DIYRequirement): string {
  const lines: string[] = [];

  lines.push(`Projektziel: ${requirement.project_goal}`);
  if (requirement.current_state) {
    lines.push(`Ausgangslage: ${requirement.current_state}`);
  }
  lines.push(`Maße/Fläche: ${requirement.dimensions}`);
  if (requirement.surface_details) {
    lines.push(`Oberfläche/Untergrund: ${requirement.surface_details}`);
  }
  lines.push(`Einsatzort: ${requirement.environment} (${requirement.indoor_outdoor})`);
  if (requirement.materials.length) {
    lines.push(`Material/Stil: ${requirement.materials.join(', ')}`);
  }
  if (requirement.finish_preference) {
    lines.push(`Finish/Look: ${requirement.finish_preference}`);
  }
  if (requirement.style_reference) {
    lines.push(`Stilreferenz: ${requirement.style_reference}`);
  }
  if (requirement.tools_available.length) {
    lines.push(`Vorhandene Werkzeuge: ${requirement.tools_available.join(', ')}`);
  }
  lines.push(`Erfahrungslevel: ${requirement.skill_level}`);
  if (requirement.experience_notes) {
    lines.push(`Zusatz zur Erfahrung: ${requirement.experience_notes}`);
  }
  if (requirement.budget) {
    lines.push(`Budgetrahmen: ${requirement.budget}`);
  }
  if (requirement.timeline) {
    lines.push(`Zeitplan: ${requirement.timeline}`);
  }
  if (requirement.special_considerations) {
    lines.push(`Besondere Hinweise: ${requirement.special_considerations}`);
  }

  return lines.join('\n');
}

export function mapRequirementToFormData(requirement: DIYRequirement) {
  return {
    projectDescription: formatRequirementSummary(requirement),
    experienceLevel: requirement.skill_level,
    deliveryDownload: requirement.delivery_options.download,
    deliveryEmail: requirement.delivery_options.email,
    phoneSupport: requirement.support_options?.phone_support ?? false,
    onsiteSupport: requirement.support_options?.onsite_support ?? false,
    location: requirement.support_options?.location ?? '',
    name: requirement.contact.name,
    email: requirement.contact.email,
    phone: requirement.contact.phone,
  };
}


