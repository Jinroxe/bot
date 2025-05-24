import Layout from '../components/Layout'
import { useEffect, useState } from "react";
import axios from "axios";

export default function Config() {
  const [guilds, setGuilds] = useState([]);
  const [guildId, setGuildId] = useState("");
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    staff_role_id: "",
    embed_title: "Carte de fidélité",
    embed_color: "#3498db",
    embed_image: "",
    embed_message: "Bravo pour ta fidélité !",
    embed_footer: "Rendez-vous chez Paleto Custom pour chaque service effectué."
  });

  useEffect(() => {
    axios.get("/api/guilds").then(res => setGuilds(res.data));
  }, []);

  useEffect(() => {
    if (guildId) {
      axios.get(`/api/config?guild_id=${guildId}`).then(res => setForm(res.data));
      axios.get(`/api/config?guild_id=${guildId}&roles=1`).then(res => setRoles(res.data));
    }
  }, [guildId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post("/api/config", { ...form, guild_id: guildId });
    alert("Configuration enregistrée !");
  };

  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block font-bold mb-1">Serveur Discord</label>
          <select
            value={guildId}
            onChange={e => setGuildId(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choisir un serveur --</option>
            {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">Rôle staff</label>
          <select
            name="staff_role_id"
            value={form.staff_role_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Sélectionner un rôle --</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">Titre de l’embed</label>
          <input
            name="embed_title"
            value={form.embed_title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Couleur de l’embed</label>
          <input
            name="embed_color"
            value={form.embed_color}
            onChange={handleChange}
            type="color"
            className="w-16 h-10 border rounded"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Image de l’embed (URL)</label>
          <input
            name="embed_image"
            value={form.embed_image}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Message de l’embed</label>
          <textarea
            name="embed_message"
            value={form.embed_message}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Footer de l’embed</label>
          <input
            name="embed_footer"
            value={form.embed_footer}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-800 transition"
        >
          Enregistrer
        </button>
      </form>
    </Layout>
  );
}
