"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/loader";

interface NavigationLoaderContextType {
  startLoading: () => void;
  stopLoading: () => void;
  finishWithToast: (message: string) => void;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType | null>(null);

export function NavigationLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const pendingToastRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(false);

    if (pendingToastRef.current) {
      toast.success(pendingToastRef.current);
      pendingToastRef.current = null;
    }
  }, [pathname]);

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => setLoading(false);

  const finishWithToast = (message: string) => {
    pendingToastRef.current = message;
  };

  return (
    <NavigationLoaderContext.Provider value={{ startLoading, stopLoading, finishWithToast }}>
      {children}

      {loading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}
    </NavigationLoaderContext.Provider>
  );
}

export function useNavigationLoader() {
  const context = useContext(NavigationLoaderContext);

  if (!context) {
    throw new Error(
      "useNavigationLoader must be used within NavigationLoaderProvider"
    );
  }

  return context;
}