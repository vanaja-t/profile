import { CloudUpload } from 'lucide-react'
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
 * Publish/deploy instructions, opened from /customize alongside
 * SetupGuideDialog — separated out because "how do I turn GitHub Pages on"
 * is a one-time repo-settings task independent of, and asked about later
 * than, "how do I set up my content" (see SetupGuideDialog's Deploy step,
 * which now points here for the full walkthrough).
 */
export function PublishGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm">
          <CloudUpload className="size-4" aria-hidden="true" />
          Publish to GitHub Pages
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publishing your site</DialogTitle>
          <DialogDescription>
            A one-time settings step, then every push to <Code>main</Code> deploys automatically.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-5">
          <Step n={1} title="Turn on GitHub Pages (one-time)">
            On GitHub, open your repo&rsquo;s <strong>Settings → Pages</strong>. Under{' '}
            <strong>Build and deployment → Source</strong>, choose <strong>GitHub Actions</strong>.
          </Step>

          <Step n={2} title="Push to deploy">
            Commit and push to <Code>main</Code> — a GitHub Actions workflow builds the site and
            deploys it automatically. No manual build step, no branch to push to.
          </Step>

          <Step n={3} title="Check it worked">
            Open your repo&rsquo;s <strong>Actions</strong> tab and watch for a green check on{' '}
            <strong>Deploy to GitHub Pages</strong>. A red X means the build failed — click into it
            to see which step errored.
          </Step>

          <Step n={4} title="Nothing to push?">
            Trigger a deploy manually: <strong>Actions</strong> →{' '}
            <strong>Deploy to GitHub Pages</strong> → <strong>Run workflow</strong>.
          </Step>

          <Step n={5} title="Find your live URL">
            Once green, your site is live at{' '}
            <Code>https://&lt;your-username&gt;.github.io/&lt;your-repo-name&gt;/</Code> — also
            shown on the Actions run itself and under Settings → Pages.
          </Step>
        </ol>
      </DialogContent>
    </Dialog>
  )
}
