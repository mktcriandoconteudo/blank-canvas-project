import { Instagram, Facebook, Youtube, Mail, MapPin, Phone, Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[hsl(220,20%,10%)] text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Caldas Resorts
            </h3>
            <p className="text-xs text-white/50">J G Locações</p>
            <p className="text-sm leading-relaxed">
              Sua experiência perfeita em Caldas Novas começa aqui. Apartamentos completos com águas termais e muito conforto.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sobre Nós */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sobre Nós</h4>
            <p className="text-sm leading-relaxed">
              Somos especializados em locações de temporada em Caldas Novas - GO. Oferecemos apartamentos em condomínios com estrutura completa de lazer e águas termais naturais.
            </p>
          </div>

          {/* Fale Conosco */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fale Conosco</h4>
            <div className="space-y-3">
              <a href="tel:+5562999999999" className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-white/50 shrink-0" />
                (62) 99999-9999
              </a>
              <a href="mailto:contato@caldasresorts.com" className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-white/50 shrink-0" />
                contato@caldasresorts.com
              </a>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Informações</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <span>Caldas Novas - GO, Brasil</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Building2 className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <span>CNPJ: 00.000.000/0001-00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Caldas Resorts — J G Locações. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/30">
            Feito com ❤️ em Caldas Novas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
