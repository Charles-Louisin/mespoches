'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/AuthGuard'
import LoadingBar from '@/components/LoadingBar'
import {
  adminReleaseApi,
  authApi,
  type AdminAppRelease,
  type EffectiveAppVersion,
  type GithubReleaseInfo,
} from '@/lib/api'
import { hydrateAuthSession } from '@/lib/auth'

/**
 * Mise à jour de l'app (nouvel APK).
 * L'app prend en priorité l'APK de la dernière release GitHub ; sinon, la version publiée ici.
 */
export default function AdminReleasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [github, setGithub] = useState<GithubReleaseInfo | null>(null)
  const [admin, setAdmin] = useState<AdminAppRelease | null>(null)
  const [effective, setEffective] = useState<EffectiveAppVersion | null>(null)
  const [form, setForm] = useState({ version: '', apkUrl: '', notes: '', minVersion: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      await hydrateAuthSession()
      const me = await authApi.me()
      if (me.role !== 'admin') {
        router.replace('/')
        return
      }
      const data = await adminReleaseApi.get()
      setGithub(data.github)
      setAdmin(data.admin)
      setEffective(data.effective)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const publish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const res = await adminReleaseApi.publish({
        version: form.version.trim(),
        apkUrl: form.apkUrl.trim(),
        notes: form.notes.trim() || undefined,
        minVersion: form.minVersion.trim() || undefined,
      })
      setEffective(res.effective)
      toast.success(`Version ${form.version} publiée`)
      setForm({ version: '', apkUrl: '', notes: '', minVersion: '' })
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publication impossible')
    } finally {
      setSaving(false)
    }
  }

  const withdraw = async () => {
    if (!confirm('Retirer la version publiée manuellement ? Seule la release GitHub restera prise en compte.')) return
    try {
      const res = await adminReleaseApi.withdraw()
      setEffective(res.effective)
      setAdmin(null)
      toast.success('Publication retirée')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible')
    }
  }

  const sourceLabel =
    effective?.source === 'github' ? 'release GitHub' : effective?.source === 'admin' ? 'publication admin' : 'aucune'

  return (
    <AuthGuard>
      {loading ? <LoadingBar /> : null}
      <main className="mx-auto min-h-dvh max-w-2xl bg-white px-4 py-8 text-ink sm:px-6">
        <Link href="/admin" className="text-sm font-medium text-primary-600 hover:underline">
          ← Console
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Mise à jour de l’app</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Les utilisateurs Android sont prévenus à l’ouverture de l’app dès qu’une version plus récente que la leur est
          annoncée. Le lien vient en priorité de l’APK de la <strong>dernière release GitHub</strong> ; sinon, de la
          version publiée ci-dessous.
        </p>

        <section className="mt-6 rounded-2xl border border-black/10 p-5">
          <h2 className="text-base font-semibold">Annoncé aux utilisateurs</h2>
          {effective?.latestVersion ? (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-mute">Version</dt>
              <dd className="font-semibold">{effective.latestVersion}</dd>
              <dt className="text-ink-mute">Source</dt>
              <dd>{sourceLabel}</dd>
              <dt className="text-ink-mute">Obligatoire avant</dt>
              <dd>{effective.minVersion ?? '—'}</dd>
              <dt className="text-ink-mute">Lien</dt>
              <dd className="break-all">
                <a href={effective.apkUrl} className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">
                  {effective.apkUrl}
                </a>
              </dd>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Aucune version annoncée.</p>
          )}
        </section>

        <section className="mt-4 rounded-2xl border border-black/10 p-5">
          <h2 className="text-base font-semibold">Release GitHub</h2>
          {github?.version ? (
            <p className="mt-2 text-sm text-ink-soft">
              v{github.version}
              {github.apkUrl ? ` · APK ${github.sizeMb ?? '?'} Mo` : ' · aucun fichier APK attaché'}
              {github.publishedAt ? ` · ${new Date(github.publishedAt).toLocaleDateString('fr-FR')}` : ''}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Aucune release trouvée (ou GitHub indisponible).</p>
          )}
        </section>

        <section className="mt-4 rounded-2xl border border-black/10 p-5">
          <h2 className="text-base font-semibold">Publier une version manuellement</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Utile si l’APK n’est pas sur GitHub (autre hébergement) ou pour annoncer une version tout de suite.
          </p>
          {admin ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm">
              <span>
                Publiée : <strong>{admin.version}</strong> le {new Date(admin.created_at).toLocaleDateString('fr-FR')}
              </span>
              <button type="button" onClick={() => void withdraw()} className="font-medium text-red-600 hover:underline">
                Retirer
              </button>
            </div>
          ) : null}
          <form onSubmit={(e) => void publish(e)} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Version (ex. 1.2.0)
              <input
                required
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                pattern="\d+\.\d+\.\d+"
                className="h-11 rounded-xl border border-black/15 px-3 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Lien de téléchargement direct de l’APK (https)
              <input
                required
                type="url"
                value={form.apkUrl}
                onChange={(e) => setForm({ ...form, apkUrl: e.target.value })}
                placeholder="https://…/MES.POCHES.apk"
                className="h-11 rounded-xl border border-black/15 px-3 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Nouveautés (affichées dans l’app)
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                maxLength={1200}
                className="rounded-xl border border-black/15 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Rendre obligatoire pour les versions inférieures à (optionnel)
              <input
                value={form.minVersion}
                onChange={(e) => setForm({ ...form, minVersion: e.target.value })}
                pattern="\d+\.\d+\.\d+"
                placeholder="ex. 1.1.0"
                className="h-11 rounded-xl border border-black/15 px-3 font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="mt-1 h-12 rounded-full bg-primary-600 px-6 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Publication…' : 'Publier et prévenir les utilisateurs'}
            </button>
          </form>
        </section>
      </main>
    </AuthGuard>
  )
}
