export type Language = 'fa' | 'en';

export interface NavItem {
  id: string;
  label: string;
}

export interface ValueChainStep {
  id: string;
  order: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  keyOutputs: string[];
  iconName: string;
}

export interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  tags: string[];
}

export interface IndustrialFacility {
  id: string;
  title: string;
  category: string;
  scale?: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  iconName: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  scope: string[];
  badge: string;
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ContactInfo {
  centralOffice: {
    title: string;
    address: string;
    city: string;
  };
  factory: {
    title: string;
    address: string;
    city: string;
  };
  phoneNumbers: string[];
  supportPhone: string;
  email: string;
  website: string;
  workingHours: string;
}
