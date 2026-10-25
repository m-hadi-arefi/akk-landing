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
  tags: string[];
  iconName: string;
  siteId: string;
}

export interface IndustrialFacility {
  id: string;
  title: string;
  category: string;
  scale?: string;
  specs: { label: string; value: string }[];
  iconName: string;
  imageSrc: string;
  imageCaption: string;
}

export interface FactoryGalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageSrc: string;
  description: string;
  badge: string;
}

export interface ProductShowcaseItem {
  id: string;
  name: string;
  carModel: string;
  category: string;
  imageSrc: string;
  code: string;
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
