import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { mockUser, ranking } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Trophy,
  Heart,
  MapPin,
  Award,
  Bell,
  Lock,
  Globe,
  Moon,
  HelpCircle,
  Info,
  Star,
  Share2,
  LogOut,
  ChevronRight,
  UserCog,
  MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/EditProfileDialog";

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const u = {
    ...mockUser,
    name: profile?.full_name || user?.email?.split("@")[0] || mockUser.name,
    city: profile?.city || mockUser.city,
    avatarUrl: profile?.avatar_url ?? null,
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notifUrgent, setNotifUrgent] = useState(true);
  const [notifNearby, setNotifNearby] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);

  const handleShare = async () => {
    const shareData = {
      title: "Pata Amiga · Teresina",
      text: "Junte-se a mim para ajudar animais abandonados em Teresina 🐾",
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link copiado", description: "Compartilhe com sua comunidade." });
      }
    } catch {
      // usuário cancelou
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Sessão encerrada",
      description: "Obrigado por ajudar 🐾",
    });
    setSettingsOpen(false);
    navigate("/auth", { replace: true });
  };

  return (
    <MobileShell>
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Perfil</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Abrir configurações"
          className="size-10 rounded-full bg-card border border-border grid place-items-center hover:bg-muted transition-colors active:scale-95"
        >
          <Settings className="size-5" />
        </button>
      </header>

      <section className="mt-5 rounded-3xl gradient-primary text-primary-foreground p-6 shadow-glow relative overflow-hidden">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
        <div className="absolute -right-12 -bottom-12 size-32 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          {u.avatarUrl ? (
            <img
              src={u.avatarUrl}
              alt={u.name}
              referrerPolicy="no-referrer"
              className="size-16 rounded-full object-cover ring-2 ring-white/70 shadow-soft"
            />
          ) : (
            <div className="size-16 rounded-full bg-white/95 text-primary grid place-items-center font-display font-bold text-2xl shadow-soft">
              {u.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg leading-tight">{u.name}</h2>
            <div className="flex items-center gap-1 text-xs opacity-90 mt-0.5">
              <MapPin className="size-3" /> {u.city}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <Trophy className="size-3.5" /> Nível {u.level} · {u.points} pts
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { v: u.helped, l: "Ajudou" },
            { v: u.reported, l: "Reportou" },
            { v: u.resolved, l: "Resolvidos" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/15 backdrop-blur p-3">
              <div className="font-display font-bold text-xl">{s.v}</div>
              <div className="text-[10px] opacity-90">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Conquistas</h2>
          <span className="text-xs text-muted-foreground">
            {u.badges.filter((b) => b.earned).length} / {u.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {u.badges.map((b) => (
            <div
              key={b.id}
              className={cn(
                "rounded-2xl p-3 text-center border transition",
                b.earned
                  ? "bg-card border-border shadow-soft"
                  : "bg-secondary/40 border-border/40 opacity-60",
              )}
            >
              <div className={cn("size-12 mx-auto rounded-full grid place-items-center text-2xl", b.earned ? "bg-primary-soft" : "bg-muted")}>
                {b.icon}
              </div>
              <div className="mt-2 text-[11px] font-semibold leading-tight">{b.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-center gap-2 mb-3">
          <Award className="size-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Comunidade · Teresina</h2>
        </div>
        <div className="rounded-3xl bg-card border border-border shadow-soft divide-y divide-border">
          {ranking.map((r, i) => {
            const me = r.id === "u1";
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-center gap-3 p-4",
                  me && "bg-primary-soft",
                )}
              >
                <div className={cn(
                  "size-8 rounded-full grid place-items-center text-xs font-bold",
                  i === 0 ? "bg-warning text-warning-foreground" :
                  i === 1 ? "bg-muted text-foreground" :
                  i === 2 ? "bg-primary-soft text-primary" :
                  "bg-secondary text-muted-foreground",
                )}>
                  {i + 1}
                </div>
                <div className="size-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-bold text-sm">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold leading-tight">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Heart className="size-3 fill-primary text-primary" /> {r.helped} ajudados
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">{r.points}</div>
              </div>
            );
          })}
        </div>
      </section>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={u}
        onEdit={() => {
          setSettingsOpen(false);
          setEditOpen(true);
        }}
        notifUrgent={notifUrgent}
        setNotifUrgent={setNotifUrgent}
        notifNearby={notifNearby}
        setNotifNearby={setNotifNearby}
        notifUpdates={notifUpdates}
        setNotifUpdates={setNotifUpdates}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        shareLocation={shareLocation}
        setShareLocation={setShareLocation}
        onShare={handleShare}
        onLogout={handleLogout}
      />
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </MobileShell>
  );
}

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: typeof mockUser;
  onEdit: () => void;
  notifUrgent: boolean;
  setNotifUrgent: (v: boolean) => void;
  notifNearby: boolean;
  setNotifNearby: (v: boolean) => void;
  notifUpdates: boolean;
  setNotifUpdates: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  shareLocation: boolean;
  setShareLocation: (v: boolean) => void;
  onShare: () => void;
  onLogout: () => void;
};

function SettingsSheet({
  open,
  onOpenChange,
  user,
  onEdit,
  notifUrgent,
  setNotifUrgent,
  notifNearby,
  setNotifNearby,
  notifUpdates,
  setNotifUpdates,
  darkMode,
  setDarkMode,
  shareLocation,
  setShareLocation,
  onShare,
  onLogout,
}: SettingsSheetProps) {
  const notify = (title: string) =>
    toast({ title, description: "Disponível em breve." });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[88vh] overflow-y-auto p-0 border-border"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted" />
        <SheetHeader className="px-5 pt-4 pb-2 text-left">
          <SheetTitle className="font-display text-xl">Configurações</SheetTitle>
          <SheetDescription>
            Personalize sua experiência no app.
          </SheetDescription>
        </SheetHeader>

        <div className="px-5 pb-8 space-y-6">
          {/* Conta */}
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-soft">
            <div className="size-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-display font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {user.city} · Nível {user.level}
              </div>
            </div>
            <button
              onClick={onEdit}
              className="text-xs font-semibold text-primary px-3 py-1.5 rounded-full bg-primary-soft"
            >
              Editar
            </button>
          </div>

          <SettingsGroup title="Notificações">
            <SettingsToggle
              icon={<Bell className="size-4" />}
              label="Casos urgentes perto de mim"
              hint="Alertas imediatos para animais em risco"
              checked={notifUrgent}
              onChange={setNotifUrgent}
            />
            <SettingsToggle
              icon={<MapPinned className="size-4" />}
              label="Novos casos no meu bairro"
              checked={notifNearby}
              onChange={setNotifNearby}
            />
            <SettingsToggle
              icon={<Heart className="size-4" />}
              label="Atualizações dos meus resgates"
              checked={notifUpdates}
              onChange={setNotifUpdates}
            />
          </SettingsGroup>

          <SettingsGroup title="Privacidade">
            <SettingsToggle
              icon={<MapPin className="size-4" />}
              label="Compartilhar localização aproximada"
              hint="Ajuda a mostrar casos relevantes"
              checked={shareLocation}
              onChange={setShareLocation}
            />
            <SettingsRow
              icon={<Lock className="size-4" />}
              label="Privacidade e dados"
              onClick={() => notify("Privacidade e dados")}
            />
            <SettingsRow
              icon={<UserCog className="size-4" />}
              label="Gerenciar conta"
              onClick={() => notify("Gerenciar conta")}
            />
          </SettingsGroup>

          <SettingsGroup title="Preferências">
            <SettingsToggle
              icon={<Moon className="size-4" />}
              label="Modo escuro"
              checked={darkMode}
              onChange={(v) => {
                setDarkMode(v);
                document.documentElement.classList.toggle("dark", v);
              }}
            />
            <SettingsRow
              icon={<Globe className="size-4" />}
              label="Idioma"
              value="Português"
              onClick={() => notify("Idioma")}
            />
          </SettingsGroup>

          <SettingsGroup title="Comunidade">
            <SettingsRow
              icon={<Share2 className="size-4" />}
              label="Convidar amigos"
              onClick={onShare}
            />
            <SettingsRow
              icon={<Star className="size-4" />}
              label="Avaliar o app"
              onClick={() => notify("Avaliar o app")}
            />
            <SettingsRow
              icon={<HelpCircle className="size-4" />}
              label="Ajuda e suporte"
              onClick={() => notify("Ajuda e suporte")}
            />
            <SettingsRow
              icon={<Info className="size-4" />}
              label="Sobre"
              value="v1.0.0"
              onClick={() => notify("Sobre")}
            />
          </SettingsGroup>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive font-semibold py-3 text-sm active:scale-[0.99] transition"
          >
            <LogOut className="size-4" /> Sair da conta
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Feito com 🐾 em Teresina
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-2">
        {title}
      </div>
      <div className="rounded-2xl bg-card border border-border shadow-soft divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 active:bg-muted transition-colors"
    >
      <span className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function SettingsToggle({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {hint && (
          <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}