import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trash2, Plus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmButtonProps {
  onConfirm: () => void;
  label?: string;
  description?: string;
  icon?: "trash" | "plus" | "help" | React.ReactNode;
  variant?: "delete" | "add" | "custom";
  className?: string;
}

export function ConfirmButton({
  onConfirm,
  label,
  description,
  icon = "trash",
  variant = "delete",
  className,
}: ConfirmButtonProps) {
  const [loading, setLoading] = useState(false);

  const iconComponent =
    icon === "trash" ? (
      <Trash2 size={18} className="stroke-[2.4]" />
    ) : icon === "plus" ? (
      <Plus size={18} className="stroke-[2.4]" />
    ) : icon === "help" ? (
      <HelpCircle size={18} className="stroke-[2.4]" />
    ) : (
      icon
    );

  const styles = {
    delete: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
    add: "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white",
    custom: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 250, damping: 16 }}
        >
          <Button
            className={cn(
              "flex gap-2 items-center font-semibold px-3 py-2 rounded-lg shadow-sm transition-all",
              styles[variant],
              className
            )}
          >
            {iconComponent}
            {label && <span>{label}</span>}
          </Button>
        </motion.div>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {label ? `Confirmar: ${label}` : "¿Estás seguro?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "Esta acción requiere tu confirmación. Puede ser irreversible."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              setLoading(true);
              onConfirm();
              setTimeout(() => setLoading(false), 600);
            }}
            className={cn(styles[variant])}
          >
            {loading ? "Procesando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
