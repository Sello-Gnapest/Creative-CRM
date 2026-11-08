"use client";

import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  ContactRound,
  Ellipsis,
  ExternalLink,
  LayoutDashboard,
  ListTodo,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  initials: string;
  color: string;
  stage: string;
  lastContact: string;
};

const initialContacts: Contact[] = [
  {
    id: "olivia-rhye",
    name: "Olivia Rhye",
    company: "Layers",
    email: "olivia@layers.com",
    initials: "OR",
    color: "lilac",
    stage: "Active client",
    lastContact: "Today",
  },
  {
    id: "phoenix-baker",
    name: "Phoenix Baker",
    company: "Catalog",
    email: "phoenix@catalog.com",
    initials: "PB",
    color: "peach",
    stage: "Lead",
    lastContact: "Yesterday",
  },
  {
    id: "lana-steiner",
    name: "Lana Steiner",
    company: "Circooles",
    email: "lana@circooles.com",
    initials: "LS",
    color: "mint",
    stage: "Active client",
    lastContact: "Oct 24",
  },
  {
    id: "demi-wilkinson",
    name: "Demi Wilkinson",
    company: "Sisyphus",
    email: "demi@sisyphus.com",
    initials: "DW",
    color: "blue",
    stage: "Prospect",
    lastContact: "Oct 22",
  },
  {
    id: "candice-wu",
    name: "Candice Wu",
    company: "Quotient",
    email: "candice@quotient.com",
    initials: "CW",
    color: "rose",
    stage: "Active client",
    lastContact: "Oct 20",
  },
];

const startingTasks = [
  { title: "Send the revised proposal to Olivia", time: "Today · 11:30 AM", done: false },
  { title: "Follow up with Phoenix about the brief", time: "Today · 2:00 PM", done: false },
  { title: "Share project timeline with Lana", time: "Tomorrow · 10:00 AM", done: false },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Contacts", icon: UsersRound },
  { label: "Tasks", icon: ListTodo, count: "6" },
  { label: "Calendar", icon: CalendarDays },
];

function isContact(value: unknown): value is Contact {
  if (!value || typeof value !== "object") return false;
  const contact = value as Record<string, unknown>;
  return ["id", "name", "company", "email", "initials", "color", "stage", "lastContact"]
    .every((key) => typeof contact[key] === "string");
}

export default function Home() {
  const [activePage, setActivePage] = useState("Overview");
  const [contacts, setContacts] = useState(initialContacts);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [tasks, setTasks] = useState(startingTasks);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formError, setFormError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      const savedContacts = window.localStorage.getItem("creative-crm-contacts");
      if (savedContacts !== null) {
        const parsedContacts: unknown = JSON.parse(savedContacts);
        if (!Array.isArray(parsedContacts) || !parsedContacts.every(isContact)) {
          throw new Error("Saved contacts have an invalid format.");
        }
        // Load browser-only data after hydration to keep server and client markup consistent.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContacts(parsedContacts);
      }
    } catch {
      setStorageAvailable(false);
      setStorageError("Saved contacts could not be loaded. Changes will stay in memory for this session.");
    } finally {
      setContactsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!contactsLoaded || !storageAvailable) return;
    try {
      window.localStorage.setItem("creative-crm-contacts", JSON.stringify(contacts));
    } catch {
      // Stop retrying the unavailable browser store after notifying the user.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageAvailable(false);
      setStorageError("Contacts could not be saved in this browser. Changes will stay in memory for this session.");
    }
  }, [contacts, contactsLoaded, storageAvailable]);

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return contacts;
    return contacts.filter((contact) =>
      `${contact.name} ${contact.company} ${contact.email}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [contacts, query]);

  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const company = String(formData.get("company")).trim() || "Independent";
    if (!name || !email) {
      setFormError("Name and email are required.");
      return;
    }

    const duplicateEmail = contacts.some((contact) =>
      contact.email.toLowerCase() === email.toLowerCase() && contact.id !== editingContact?.id,
    );
    if (duplicateEmail) {
      setFormError("A contact with this email address already exists.");
      return;
    }

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    const contact: Contact = {
      id: editingContact?.id ?? crypto.randomUUID(),
      name,
      company,
      email,
      initials,
      color: editingContact?.color ?? "blue",
      stage: String(formData.get("stage") ?? "Prospect"),
      lastContact: editingContact?.lastContact ?? "Just now",
    };
    if (editingContact) {
      setContacts((current) => current.map((item) => item.id === contact.id ? contact : item));
    } else {
      setContacts((current) => [contact, ...current]);
    }
    setActivePage("Contacts");
    setIsModalOpen(false);
    setEditingContact(null);
    setFormError("");
  }

  function openContactModal(contact?: Contact) {
    setEditingContact(contact ?? null);
    setFormError("");
    setIsModalOpen(true);
  }

  function deleteContact(contact: Contact) {
    if (!window.confirm(`Delete ${contact.name} from your contacts?`)) return;
    setContacts((current) => current.filter((item) => item.id !== contact.id));
  }

  const pageHeading =
    activePage === "Overview"
      ? "Good morning, Alex"
      : activePage === "Contacts"
        ? "Your contacts"
        : activePage === "Tasks"
          ? "Your tasks"
          : activePage;

  return (
    <main className="app-shell">
      {mobileNavOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={() => setActivePage("Overview")}>
          <span className="brand-mark"><Sparkles size={20} strokeWidth={2.2} /></span>
          <span>creative<span className="brand-light">crm</span></span>
        </a>

        <button className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-info"><strong>Alex Morgan</strong><small>Personal workspace</small></span>
          <ChevronDown size={16} />
        </button>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, count }) => (
            <button
              key={label}
              className={`nav-link ${activePage === label ? "nav-link-active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setMobileNavOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {(label === "Contacts" || count) && (
                <span className="nav-count">{label === "Contacts" ? contacts.length : count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-label integrations-label">YOUR GOOGLE WORKSPACE</div>
        <div className="integration-row"><span className="google-dot sheets-dot">▦</span><span>Sheets</span><span className="connection-dot" /></div>
        <div className="integration-row"><span className="google-dot contacts-dot"><ContactRound size={14} /></span><span>Contacts</span><span className="connection-dot" /></div>
        <div className="integration-row"><span className="google-dot calendar-dot"><CalendarDays size={14} /></span><span>Calendar</span><span className="connection-dot" /></div>
        <div className="integration-row"><span className="google-dot tasks-dot"><Check size={14} /></span><span>Tasks</span><span className="connection-dot" /></div>
        <button className="connect-link" onClick={() => setActivePage("Settings")}><Plus size={15} /> Connect Google account</button>

        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => setActivePage("Settings")}><Settings2 size={18} /> Settings</button>
          <button className="nav-link"><CircleHelp size={18} /> Help & support</button>
          <div className="user-profile">
            <div className="user-avatar">AM</div>
            <div className="user-info"><strong>Alex Morgan</strong><small>alex.morgan@email.com</small></div>
            <Ellipsis size={19} />
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." aria-label="Search contacts" />
              <kbd><Command size={11} /> K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="topbar-avatar">AM</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> TUESDAY, OCTOBER 28, 2025</div>
              <h1>{pageHeading}<span className="wave">✳</span></h1>
              <p className="page-subtitle">{activePage === "Overview" ? "Here’s what’s happening with your relationships today." : `Keep your ${activePage.toLowerCase()} organized and moving forward.`}</p>
            </div>
            <button className="primary-button" onClick={() => openContactModal()}><Plus size={17} /> Add contact</button>
          </div>

          {storageError && <div className="storage-warning" role="status">{storageError}</div>}

          {activePage === "Settings" ? (
            <section className="settings-card">
              <div className="section-title-row"><div><h2>Connected services</h2><p>Choose which Google services Creative CRM can use.</p></div></div>
              <div className="notice-banner"><Sparkles size={18} /><span><strong>Google integrations are coming soon.</strong> This early preview does not connect to or access your Google account.</span></div>
              {["Google Sheets", "Google Contacts", "Google Calendar", "Google Tasks"].map((service) => <div className="service-row" key={service}><div className="service-icon"><ExternalLink size={17} /></div><div><strong>{service}</strong><small>Planned integration</small></div><span className="planned-pill">Coming soon</span></div>)}
            </section>
          ) : (
            <>
              {activePage === "Overview" && <section className="stats-grid" aria-label="CRM summary">
                <StatCard label="Total contacts" value={String(contacts.length)} change="In your workspace" detail={storageAvailable ? "saved in this browser" : "session only"} icon={<UsersRound size={17} />} trend="up" />
                <StatCard label="Follow-ups due" value="6" change="2 overdue" detail="needs your attention" icon={<Clock3 size={17} />} trend="warm" />
                <StatCard label="Meetings this week" value="8" change="+3" detail="vs. last week" icon={<CalendarDays size={17} />} trend="up" />
                <StatCard label="Tasks completed" value="24" change="80%" detail="of weekly goal" icon={<Check size={17} />} trend="up" />
              </section>}

              {activePage === "Overview" && <section className="main-grid">
                <div className="panel contacts-panel">
                  <div className="section-title-row">
                    <div><h2>Recent contacts</h2><p>Your relationship, at a glance.</p></div>
                    <button className="text-button" onClick={() => setActivePage("Contacts")}>View all <ArrowUpRight size={15} /></button>
                  </div>
                  <ContactTable contacts={filteredContacts.slice(0, 5)} onEdit={openContactModal} onDelete={deleteContact} />
                </div>
                <div className="panel tasks-panel">
                  <div className="section-title-row">
                    <div><h2>Up next</h2><p>Stay close to what matters.</p></div>
                    <button className="more-button" aria-label="Task options"><Ellipsis size={19} /></button>
                  </div>
                  <div className="task-list">
                    {tasks.map((task, index) => <button className={`task-item ${task.done ? "task-done" : ""}`} key={task.title} onClick={() => setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item))}>
                      <span className="task-check">{task.done && <Check size={13} />}</span>
                      <span className="task-content"><strong>{task.title}</strong><small><Clock3 size={13} /> {task.time}</small></span>
                    </button>)}
                  </div>
                  <button className="all-tasks-button" onClick={() => setActivePage("Tasks")}>See all tasks <ArrowUpRight size={14} /></button>
                </div>
              </section>}

              {activePage === "Overview" && <section className="bottom-grid">
                <div className="panel calendar-panel">
                  <div className="section-title-row">
                    <div><h2>Your week</h2><p>Make room for good conversations.</p></div>
                    <button className="text-button">Open calendar <ArrowUpRight size={15} /></button>
                  </div>
                  <div className="week-strip">
                    {[["MON", "27"], ["TUE", "28"], ["WED", "29"], ["THU", "30"], ["FRI", "31"], ["SAT", "01"], ["SUN", "02"]].map(([day, date]) => <div key={day} className={`day-column ${date === "28" ? "day-today" : ""}`}><span>{day}</span><strong>{date}</strong><i className={date === "28" || date === "30" || date === "31" ? "has-event" : ""} /></div>)}
                  </div>
                  <div className="event-card"><div className="event-time"><strong>11:30</strong><span>AM</span></div><div className="event-color-bar" /><div className="event-info"><strong>Creative direction catch-up</strong><span>Olivia Rhye · Google Meet</span></div><span className="event-tag">30 min</span></div>
                </div>
                <div className="panel activity-panel">
                  <div className="section-title-row"><div><h2>Recent activity</h2><p>A little progress goes a long way.</p></div><button className="more-button" aria-label="Activity options"><Ellipsis size={19} /></button></div>
                  <div className="activity-list">
                    <ActivityItem initials="OR" color="lilac" text={<><strong>Olivia Rhye</strong> replied to your email</>} time="24 min ago" />
                    <ActivityItem initials="PB" color="peach" text={<><strong>Phoenix Baker</strong> was added to contacts</>} time="2 hours ago" />
                    <ActivityItem initials="LS" color="mint" text={<><strong>Lana Steiner</strong> meeting notes updated</>} time="Yesterday" />
                  </div>
                </div>
              </section>}

              {activePage === "Contacts" && <section className="panel directory-panel"><div className="section-title-row"><div><h2>All contacts</h2><p>{contacts.length} people in your network</p></div><button className="filter-button"><SlidersHorizontal size={15} /> Filters <ChevronDown size={14} /></button></div><ContactTable contacts={filteredContacts} onEdit={openContactModal} onDelete={deleteContact} /></section>}

              {activePage === "Tasks" && <section className="panel directory-panel"><div className="section-title-row"><div><h2>Follow-ups</h2><p>Small thoughtful actions, right on time.</p></div><button className="filter-button"><ArrowDown size={15} /> Due date <ChevronDown size={14} /></button></div><div className="task-list task-list-large">{tasks.map((task, index) => <button className={`task-item ${task.done ? "task-done" : ""}`} key={task.title} onClick={() => setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item))}><span className="task-check">{task.done && <Check size={13} />}</span><span className="task-content"><strong>{task.title}</strong><small><Clock3 size={13} /> {task.time}</small></span><ChevronRight size={17} className="task-chevron" /></button>)}</div></section>}

              {activePage === "Calendar" && <section className="panel calendar-panel calendar-page"><div className="section-title-row"><div><h2>This week</h2><p>Your conversations and commitments, all in one place.</p></div><div className="calendar-controls"><button className="icon-button"><ChevronLeft size={17} /></button><button className="icon-button"><ChevronRight size={17} /></button></div></div><div className="week-strip">{[["MON", "27"], ["TUE", "28"], ["WED", "29"], ["THU", "30"], ["FRI", "31"], ["SAT", "01"], ["SUN", "02"]].map(([day, date]) => <div key={day} className={`day-column ${date === "28" ? "day-today" : ""}`}><span>{day}</span><strong>{date}</strong><i className={date === "28" || date === "30" || date === "31" ? "has-event" : ""} /></div>)}</div><div className="event-card"><div className="event-time"><strong>11:30</strong><span>AM</span></div><div className="event-color-bar" /><div className="event-info"><strong>Creative direction catch-up</strong><span>Olivia Rhye · Google Meet</span></div><span className="event-tag">30 min</span></div><div className="event-card muted-event"><div className="event-time"><strong>2:00</strong><span>PM</span></div><div className="event-color-bar peach-bar" /><div className="event-info"><strong>Project discovery call</strong><span>Phoenix Baker · Phone call</span></div><span className="event-tag">45 min</span></div></section>}
            </>
          )}

          <footer className="page-footer"><span>Made for meaningful connections <span className="footer-heart">♥</span></span><span><span className="status-dot" /> Local demo · Not connected to Google</span></footer>
        </div>
      </section>

      {isModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsModalOpen(false); setEditingContact(null); setFormError(""); } }}><section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="modal-icon"><UsersRound size={19} /></div><h2 id="modal-title">{editingContact ? "Edit contact" : "Add a contact"}</h2><p>{editingContact ? "Keep their details up to date." : "A new connection starts with a name."}</p></div><button className="icon-button" aria-label="Close dialog" onClick={() => { setIsModalOpen(false); setEditingContact(null); setFormError(""); }}><X size={19} /></button></div><form onSubmit={saveContact}><label>Full name<input name="name" placeholder="e.g. Jamie Chen" defaultValue={editingContact?.name} required autoFocus /></label><label>Email address<input name="email" type="email" placeholder="jamie@company.com" defaultValue={editingContact?.email} required /></label><label>Company <span className="optional-label">Optional</span><input name="company" placeholder="Where they work" defaultValue={editingContact?.company} /></label><label>Relationship stage<select name="stage" defaultValue={editingContact?.stage ?? "Prospect"}><option>Active client</option><option>Lead</option><option>Prospect</option></select></label>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="modal-note"><Mail size={15} /> {storageAvailable ? "Contacts are saved in this browser on this device." : "Contacts are kept for this session only."}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => { setIsModalOpen(false); setEditingContact(null); setFormError(""); }}>Cancel</button><button type="submit" className="primary-button">{editingContact ? "Save changes" : "Add contact"} <ArrowUpRight size={15} /></button></div></form></section></div>}
    </main>
  );
}

function StatCard({ label, value, change, detail, icon, trend }: { label: string; value: string; change: string; detail: string; icon: React.ReactNode; trend: "up" | "warm" }) {
  return <article className="stat-card"><div className="stat-heading"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className={`stat-change ${trend === "warm" ? "stat-warm" : ""}`}>{trend === "up" && <ArrowUpRight size={13} />}{change}</span><span>{detail}</span></div></article>;
}

function ContactTable({ contacts, onEdit, onDelete }: { contacts: Contact[]; onEdit: (contact: Contact) => void; onDelete: (contact: Contact) => void }) {
  return <div className="table-wrap"><table className="contact-table"><thead><tr><th>NAME</th><th>COMPANY</th><th>STAGE</th><th>LAST CONTACT</th><th aria-label="Actions" /></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}><td><div className="contact-person"><Avatar initials={contact.initials} color={contact.color} /><span><strong>{contact.name}</strong><small>{contact.email}</small></span></div></td><td>{contact.company}</td><td><span className={`stage-pill ${contact.stage === "Active client" ? "stage-active" : contact.stage === "Lead" ? "stage-lead" : "stage-prospect"}`}><i />{contact.stage}</span></td><td>{contact.lastContact}</td><td><div className="contact-actions"><button className="row-more" aria-label={`Edit ${contact.name}`} onClick={() => onEdit(contact)}><Pencil size={15} /></button><button className="row-more" aria-label={`Delete ${contact.name}`} onClick={() => onDelete(contact)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{contacts.length === 0 && <div className="empty-state"><Search size={20} /><strong>No contacts found</strong><span>Try another name, company, or email.</span></div>}</div>;
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return <span className={`contact-avatar avatar-${color}`}>{initials}</span>;
}

function ActivityItem({ initials, color, text, time }: { initials: string; color: string; text: React.ReactNode; time: string }) {
  return <div className="activity-item"><Avatar initials={initials} color={color} /><div className="activity-text"><span>{text}</span><small>{time}</small></div></div>;
}
