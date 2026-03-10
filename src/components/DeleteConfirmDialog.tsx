import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const DeleteConfirmDialog = ({
  onConfirm,
  title = "Confirmar exclusão",
  description = "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
  children,
}: DeleteConfirmDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      {children || (
        <button className="p-1.5 rounded hover:bg-destructive/10">
          <Trash2 size={14} className="text-destructive" />
        </button>
      )}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
