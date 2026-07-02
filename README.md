# SE FRMS Frontend

React + Vite + Tailwind starter structure.

## Scripts

- `npm.cmd install` - install dependencies from PowerShell on Windows
- `npm.cmd run dev` - start the development server
- `npm.cmd run build` - build for production
- `npm.cmd run preview` - preview the production build
- `npm.cmd run lint` - run ESLint

If PowerShell shows `npm.ps1 cannot be loaded because running scripts is disabled`,
use `npm.cmd` as shown above. To permanently allow npm's PowerShell shim for your
current Windows user, run PowerShell as your normal user and execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
