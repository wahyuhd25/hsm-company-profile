export interface SubCategory {
  num: string;
  name: string;
  desc: string;
}

export interface Category {
  id: number;
  num: string;
  name: string;
  desc: string;
  subCategories: SubCategory[];
}
