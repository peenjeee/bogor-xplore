export type Place = {
  id: number;
  nama: string;
  kategori: string | null;
  label: string | null;
  deskripsi: string | null;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  fasilitas: string | null;
  harga_tiket: string | null;
  jam_operasional: string | null;
  telepon: string | null;
  url: string | null;
  url_gambar: string | null;
  tags: string | null;
  likes: number | null;
  author: string | null;
  sumber: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PlaceListResult = {
  places: Place[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SearchParams = {
  search?: string;
  category?: string;
  page?: string;
};
