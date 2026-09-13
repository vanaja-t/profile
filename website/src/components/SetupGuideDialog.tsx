import { Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Code, Step } from '@/components/GuideStep'

/**
 * Setup instructions (ST-083), rendered in-app rather than as a README —
 * the /customize page already is "the one place a forker looks," so a
 * modal here reaches the same person a README would, without needing a
 * separate file to keep in sync with how the app actually works. Also
 * covers the OjasaMirai attribution note that would otherwise have lived
 * in a README/MAINTAINER-GUIDE.md section (ST-093).
 */
export function SetupGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm">
          <Rocket className="size-4" aria-hidden="true" />
          Setup your profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Setting up your fork</DialogTitle>
          <DialogDescription>
            Everything you need to turn this template into your own site — no external docs
            required.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-5">
          <Step n={1} title="You're already forked — consider a rename">
            If you can see this page, you&rsquo;ve already forked and cloned the template. If you
            haven&rsquo;t renamed the repo yet, now&rsquo;s the time: something short like{' '}
            <Code>profile</Code> reads better in your live URL than the template&rsquo;s original
            name. Rename it from your repo&rsquo;s <strong>Settings</strong> on GitHub — no need to
            touch <Code>basePath</Code> anywhere, it&rsquo;s computed automatically from whatever
            the repo is currently named when GitHub Actions builds the site.
          </Step>

          <Step n={2} title="Set your identity">
            Your name/bio, site title, tagline, and social links live in{' '}
            <Code>site.config.json</Code>, <Code>personal.json</Code>, and <Code>socials.json</Code>{' '}
            — edit them field-by-field, no JSON syntax required, in the{' '}
            <Link to="/dev/content" className="text-primary underline underline-offset-2">
              JSON Content Editor
            </Link>{' '}
            (needs <Code>npm run dev</Code> running locally).
          </Step>

          <Step n={3} title="Add your content">
            Experience, projects, skills, education, certifications, awards, testimonials, and
            gallery all live under <Code>src/data/*.json</Code> — same{' '}
            <Link to="/dev/content" className="text-primary underline underline-offset-2">
              JSON Content Editor
            </Link>
            . Blog posts live under <Code>content/blog/</Code> — write and edit them in the{' '}
            <Link to="/dev/blog" className="text-primary underline underline-offset-2">
              Blog Post Editor
            </Link>
            .
          </Step>

          <Step n={4} title="Set up your contact form">
            The contact form posts to{' '}
            <a
              href="https://formspree.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Formspree
            </a>
            . Create a free account and a new form there, then paste the form&rsquo;s endpoint URL
            into <Code>contactForm.endpoint</Code> in <Code>site.config.json</Code> (via the JSON
            Content Editor). Leaving <Code>contactForm</Code> out entirely hides the form — your
            email and socials still show either way.
          </Step>

          <Step n={5} title="Pick (or add) a theme">
            Set <Code>defaultTheme</Code> in <Code>site.config.json</Code> to one of the four
            shipped themes, or list several in <Code>availableThemes</Code> to let visitors switch.
            To add a fifth theme: create a new file in <Code>src/themes/</Code>, register it in{' '}
            <Code>src/themes/index.ts</Code>, then add its id to <Code>availableThemes</Code>.
          </Step>

          <Step n={6} title="Toggle sections">
            Each entry in <Code>site.config.json.navigation</Code> has an <Code>enabled</Code> flag
            and an <Code>order</Code> — turn sections on/off or reorder them without touching any
            component code.
          </Step>

          <Step n={7} title="Preview locally">
            Run <Code>npm run dev</Code> and check every section, theme, and page looks right before
            you deploy.
          </Step>

          <Step n={8} title="Deploy">
            Push to <Code>main</Code> — a GitHub Actions workflow builds and deploys to GitHub Pages
            automatically. First time only, see the <strong>Publish to GitHub Pages</strong> link
            below for the one-time settings step.
          </Step>

          <Step n={9} title="About the footer badge">
            Every fork keeps a small OjasaMirai attribution badge in the footer. It&rsquo;s
            intentional and CI-enforced (a test fails the build if it&rsquo;s altered or removed) —
            not something to edit out.
          </Step>
        </ol>
      </DialogContent>
    </Dialog>
  )
}
