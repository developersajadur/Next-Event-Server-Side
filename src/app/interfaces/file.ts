export type ICLoudinaryResponse = {
  asset_id: String;
  public_id: String;
  version: Number;
  version_id: String;
  signature: String;
  width: Number;
  height: Number;
  format: String;
  resource_type: String;
  created_at: String;
  tags: String[];
  bytes: Number;
  type: String;
  etag: String;
  placeholder: Boolean;
  url: String;
  secure_url: String;
  asset_folder: String;
  display_name: String;
  overwritten: true;
  original_filename: String;
  api_key: String;
};

export type IFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};
