import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
        >
          <div className="bg-card border border-border rounded-2xl p-5 shadow-lg relative">
            <button
              onClick={() => setVisible(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-3 pr-5">
              <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3
                  className="text-sm font-bold text-foreground mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Uso de Cookies
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, 
                  personalizar conteúdo e analisar o tráfego do site, conforme nossa{" "}
                  <span className="text-primary font-medium">Política de Privacidade</span> e a{" "}
                  <span className="text-primary font-medium">LGPD (Lei nº 13.709/2018)</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleReject}
                className="flex-1 text-sm font-semibold py-2 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Recusar
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 text-sm font-semibold py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
