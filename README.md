# Snips, Dots 'n' Schemes

This repository has two jobs.

1. **Standards.** Engineering rules live here as plain Markdown. A small compiler turns a profile into the file Cursor, Copilot, or a CLI agent actually reads.
2. **A new Mac.** Shell, Git, SSH, and editor settings are templates. You symlink or copy them onto a machine. Nothing in this repo writes to `$HOME` for you.

The Markdown in `knowledge/` is the source. Generated IDE files and a configured laptop are outputs.

## Layout

```text
knowledge/     one standard per file
profiles/      which modules a kind of project gets
bin/           compile-context.js
bash/  zsh/    shell templates
git/           gitconfig template and git/bin helpers
ssh/           GitHub host template
vscode/        editor settings and extension list
```

## Compile rules into a project

You need Node.js. The script uses only the Node standard library.

From this repository:

```bash
node bin/compile-context.js --profile=<profile> --target=<target> --out=<project>
```

`--out` defaults to the current directory. The script reads `knowledge/` from this repo, not from the project.

| Profile | Use it for |
| --- | --- |
| `fintech` | Money movement, webhooks, authorization, Drizzle |
| `exchange` | The fintech set, plus Kafka, Redis locks, and sockets |
| `saas` | Next.js, tRPC, FastAPI, tenancy, billing, GitHub Actions |

| Target | Writes |
| --- | --- |
| `cursor` | `<project>/.cursor/rules/*.mdc` |
| `copilot` | `<project>/.github/copilot-instructions.md` |
| `cli` | `<project>/.ai-context.md` |

Cursor maps each module's `file_patterns` to globs, so a React edit does not receive Kafka rules. Copilot and the CLI cannot route by file. Their output says which paths each section applies to.

A second Cursor compile deletes only the `.mdc` files named in `<project>/.cursor/rules/.compile-context.json`, then writes the profile again. A rule you added by hand in that folder is left alone.

Examples:

```bash
node bin/compile-context.js --profile=saas --target=cursor --out="$HOME/src/my-app"
node bin/compile-context.js --profile=saas --target=copilot --out="$HOME/src/my-app"
node bin/compile-context.js --profile=fintech --target=cli --out="$HOME/src/my-app"
```

Pass `.ai-context.md` to the CLI agent, for example `aider --read .ai-context.md`.

Commit the generated files in the application repo so the rest of the team gets them. Do not commit generated files in this repository. When a standard changes, edit `knowledge/`, run the compiler again, and commit the updated output in the app.

`knowledge/00-ai-behavior.md` is the only module with `global: true`. It is included in every profile.

## Set up a new machine

Clone this repo, then point the tools at it. Replace `<YOUR_…>` placeholders before you rely on Git or SSH.

1. Homebrew on a login shell, in `~/.zprofile` (this repo does not ship that file):

   ```bash
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```

2. Symlink the shared shell, Git, and SSH config:

   ```bash
   REPO="$HOME/path/to/snipsdotsnschemes"
   ln -s "$REPO/zsh/.zshrc" ~/.zshrc
   ln -s "$REPO/git/.gitconfig" ~/.gitconfig
   ln -s "$REPO/ssh/config" ~/.ssh/config
   ```

3. In `~/.gitconfig`, set `<YOUR_NAME>` and `<YOUR_EMAIL>`. In `~/.ssh/config`, set `<YOUR_GITHUB_KEY>` and `<YOUR_SECOND_GITHUB_KEY>` to key files that exist. Both hosts are `github.com`.

4. Optional local aliases (project directories, non-GitHub hosts). They stay out of git:

   ```bash
   cp "$REPO/zsh/.zshrc.local.example" "$REPO/zsh/.zshrc.local"
   ```

   Edit that file. `zsh/.zshrc` sources it when the symlink is in place.

5. If you use bash, symlink the snippets into `$HOME`. `.bash_profile` sources them from there:

   ```bash
   ln -s "$REPO/bash/.bash_profile" ~/.bash_profile
   ln -s "$REPO/bash/.aliases" ~/.aliases
   ln -s "$REPO/bash/.functions" ~/.functions
   ln -s "$REPO/bash/.colors" ~/.colors
   ln -s "$REPO/bash/.prompt" ~/.prompt
   ```

6. Put `git/bin` on your `PATH` if you want `githash` and `gitprune`.

7. Editor settings are copies, not symlinks, so a local tweak does not edit this repo. On a new Mac, copy `vscode/settings.json` to both:

   - `~/Library/Application Support/Code/User/settings.json`
   - `~/Library/Application Support/Cursor/User/settings.json`

   Then merge `vscode/cursor.settings.json` into the Cursor file only. Install the extensions named in `vscode/extensions.json`. If those user files already exist, merge the keys. Do not replace a settings file blindly.

Open a new terminal after the symlinks. `~/.zshrc` expects Oh My Zsh at `~/.oh-my-zsh`.

## Set up a new project

1. Create the app repo and choose the closest profile: `saas`, `fintech`, or `exchange`.
2. Compile once for each tool the people on that repo use (`cursor`, `copilot`, `cli`).
3. Commit the generated files.
4. Add a hand-written rule under `.cursor/rules/` only for a constraint that belongs to that repo and not in `knowledge/`. The compiler will not delete it.
5. After you change a module or a profile here, compile again into the app and commit the diff.

A module that is not listed in the profile is not written, even though the file exists in `knowledge/`. Django, Vue, CDK, Supabase RLS, and the exchange modules stay out of `saas` for that reason.
