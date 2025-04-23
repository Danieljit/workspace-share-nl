@echo off
echo Installing animated icons...

REM List of icons to install
set icons=airplane bell calendar-check calendar-days cart home user settings search wifi coffee building map-pin star heart message-square phone-call credit-card check-circle x-circle alert-circle info

for %%i in (%icons%) do (
    echo Installing icon: %%i
    npx shadcn@latest add "https://icons.pqoqubbw.dev/c/%%i.json" --yes
    echo.
)

echo All icons installed successfully!
pause
