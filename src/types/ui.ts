
export interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export interface LikeButtonProps {
  isLiked: boolean;
  likes: string;
  onLike: (e: React.MouseEvent) => void;
  className?: string;
}

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  onContinue?: () => void;
  preventOutsideClick?: boolean;
  title: string;
  children: React.ReactNode;
}