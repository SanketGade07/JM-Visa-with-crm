const LEAD_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
];

export const getLeadAvatar = (id: string, index: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarIndex = Math.abs(hash) % LEAD_AVATARS.length;
  return LEAD_AVATARS[avatarIndex];
};

export const getLeadDescription = (lead: any) => {
  if (lead.notes && lead.notes.trim().length > 0) {
    const lines = lead.notes.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && !trimmed.startsWith("Received via") && !trimmed.startsWith("Source:") && !trimmed.startsWith("Service:")) {
        return trimmed;
      }
    }
  }
  return `Interested in ${lead.visaType} for ${lead.country}`;
};

export const getLeadCompany = (lead: any) => {
  const companySuffixes = ["Solutions", "Data Inc.", "Systems", "Technologies", "Innovations", "Group", "Dynamics", "Industries", "Global", "OmniCorp"];
  let hash = 0;
  for (let i = 0; i < lead.id.length; i++) {
    hash = lead.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const suffixIndex = Math.abs(hash) % companySuffixes.length;
  const firstWord = lead.name.split(' ')[0] || "Global";
  return `${firstWord} ${companySuffixes[suffixIndex]}`;
};
