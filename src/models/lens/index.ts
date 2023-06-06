interface LensProfile {
  id: string;
  name: string | null;
  handle: string;
  ownedBy: string;
  picture: LensPictureMediaSet | null;
}

interface LensPictureMediaSet {
  original: LensMedia;
}

interface LensMedia {
  url: string; // Url
}
