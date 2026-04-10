# Title Here

Years ago, I used 2x 4K monitors pretty regularly in my daily routines. I used on horizontally for monitoring and testing things (e.g. terminals and browsers) and one vertically for code viewing. Over the years, for reasons, I've switched to both of my monitors in horizontal position. 1. The asymmetric nature of my preferences was a PITA whenever I used non-Linux systems. 2. I found myself not really needing to see as much code all at once anymore (based on preference, not use case).

Today, I try to work entirely out of the single monitor that is in front of me. I've trained myself to only require a single monitor through the use of several common features in the tools I use.

- Virtual Desktops
- Tmux Sessions
- KZones

## KZones

I've used Windows as a development environment for over a decade. As such, I became a big fan of PowerTool's Hot Zones feature. A similar feature can be found in KDE Plasma via the externally contributed KWin Script called KZones. The major different in KZones and Hot Zones is that you have to manually define the zones in JSON, but I've developed a set of zone configurations that work well for all of my use cases. There are two major categories:

- Thirds - This category is geared for use on smaller screens (e.g. my laptop screen). There are zones that are thirds and two thirds of the screen. Additionally, I've added zones for half height thirds of the screen. An example of the thirds configuration might be to have an IDE cover the left two thirds of the screen and the terminal window cover the right third. Note: 2/3 of the screen is really minimal for being able to see the code I am working.

- Quarters - This category is geared for use on larger screens (e.g. my 32" 4K monitor). There are zones that are half width, half width/height, quarter width, quarter width/height, quarter-width/half-height. An example of this might be an IDE that takes half of the screen, a terminal that takes a middle quarter, and then two applications off to the right that take a quarter width and half height each. Note: A major driver for this is the amount of effort required for me to focus on both the IDE and terminal across the full width of the screen compared to using 3/4 of the width of the screen.

## Virtual Desktops

Right, so I now have KZones, but now I can't fit all of the windows I want on my monitor all at once. Also, there are obvious situations where I may want to change my focus on what I'm working. I use virtual desktops for this.

- Desktop 1 - The first desktop is always for IDE (left) and Terminal Emulator (right). (Note: The IDE may also be a terminal emulator, but always a different window.)
- Desktop 2 - The second desktop is always for IDE (the same IDE as Desktop 1) and Browser (right).

I deliberately make the IDE visible on both desktop 1 and desktop 2. The terminal is (at this point), only visible on desktop 1. The browser of only visible on desktop 2. With this setup, I can quickly toggle between the terminal and the browser without losing focus of the code. The general flow is, use terminal to run/debug code, use browser to read API documentation.

- Desktop 3 - The third desktop is for browser focused work. I usually have the browser encompass majority of the screen on the right side. I keep the browser on the right to both match the muscle memory of where I have the browser on desktop 2, but I also don't want my brain to confuse coding with web research. On the left side of this desktop, I keep another terminal emulator.

Because I use tmux in nearly every case, I've usually attached both the terminal in desktop 1 and the terminal in desktop 3 to the same **tmux session**. This allows the same terminal view, even though they are in different positions on the screen. Additionally, Zen has been working to have shared browser tabs across Zen windows. _When it works_, this allows me to additionally have Zen opened on Desktop 2 and Desktop 3 with the same tabs. The reality is that it doesn't work well at all, so I've also created **Zen spaces** for each unique (long-lived) window instance of Zen.

- Desktop 4 - The forth desktop is for distraction related things: music (e.g. Spotify), chats, and a space for media (e.g. YouTube).

Those are intended to be the staples that I aim to engrave in my psyche. I usually keep two additional desktops around for adhoc usage. That gives me a grand total of 6 virtual desktops that I can rapidly switch between. Personally, I prefer to use Meta+"Number" as my hot key.

By using Virtual Desktops in this way, I've eliminated MOST of the issues that might cause me to think "I need a second monitor.".

## Screen Changes

As someone who has recently purchased a new laptop, I've now found myself connecting and disconnecting my laptop to my 4K monitor more often. This has the nasty side effect of jumbling up my windows when switching between the two. Annoyingly, I have some standard setups, but there is no clean way to manage the reconfiguration of those windows when the 4K monitor is both connected and disconnected from the laptop. Also, KDE can save your session (i.e. the window states), but that doesn't do anything for changing screen configurations.

The solution I've come up with is a KWin script. The script monitors for screen changes and determines if there is a 4K monitor attached or just a laptop monitor (i.e. docked mode or mobile mode). When I am in mobile mode, I have applications spread out across more virtual desktops because of screen size. I also use different ratios for the zones based on screen size. Once I dock the laptop and connect the 4K monitor, I want that monitor to be the primary, but I also want relevant zones from the laptop screen to automatically move to different zone geometry and different virtual desktops on a different screen. .... maybe a lot, but not unintuitive when you are using the setup.

The general idea behind the KWin script is to map "roles" to "zones". Then we map the location of the role to a zone and automatically update the windows in the source zones to the destination zones when we detect a screen state change. In example, when in mobile mode I may have an IDE on Laptop-Screen/Desktop-1/Left-Two-Thirds-Zone. The moment I plug in my 4K, the KWin script detects the window on that screen/desktop/zone and updates its state to be on 32"4K-Screen/Desktop-1/Left-Half-Zone. While tied to KDE, its application agnostic (in contrast to used `--class` and `.desktop` files to override XDG settings).

## Activities

When I heard about activities, I thought they were going to be more powerful than they are. I wanted activities to do more of the window management that I've described above. I'd have a mobile activity and a desk activity and depending on the activity, it'd restore the state of the window frames for that activity. Nope, not a change.

Activities do provide value (however little):

- Additional level of _application filtering_. Its like having tabs for sets of virtual desktops.
- Activities do management more of the KDE Desktop elements than virtual desktops: wall papers, preferences, panel options, and so forth.

## The Second Monitor

While I've eliminated my second 4K monitor on my desk, I do still have my laptop screen as an additional monitor. Effectively, this becomes a place for things to remain visible but ignored. I know a lot of other folks will use this space for chats and terminal. The only terminal I would keep there is resource monitoring (`btop`) and logs (`journalctl`). Keeping chats or virtual meetings there makes sense, but I really think its best to keep interrupters out of sight and out of mind for deep thinking activity (i.e. keep it on a virtual desktop intentionally for distractions).

## Other Things

- Ultra wide monitors only encourage more neck movement and peripheral eye strain. Even my 32" is too wide for full use when I'm sitting at my desk. Great for games and movies, meh for fine detail work on code, art, or analysis.

- Monitor height is critical for good posture. Having a monitor high enough to keep a laptop beneath it open and for use is never good. You want the top of your monitor to be at straight ahead eye level with a bias of looking down. You never want to look up at a monitor for extended periods of time. I keep my laptop to the left of my monitor and at a high angle stand so that the top of its screen is also as close to eye level as I can make it.

- My zones all have 8 pixel padding to give it more of a modern tiling manager polish feel. I've tried some tiling managers and they all lack an adhoc flexibility that I am looking for. Hot Zones and KZones invert the equation, they provide a tile like feel in a completely non-tiled environment. That is more of what I want, especially when I've developing new work flows or performing more adhoc things.

- I've evaluated a number of different desktop environments across X11, Wayland, Windows, and TUI. While Wayland is absolute garbage for power users, it does have some benefits, namely that its the thing evolving (new generation and all that). In terms of Wayland powered desktop environments, KDE felt the most customizable. **Also**, Dophin is the _only_ file manager that had a sufficient side bar file preview feature. If I want to see the contents of a picture, I click the file name and there it is. File manager developers have lost all perspective on UX. The only ones worth their salt are MacOS, Windows, and KDE. End of story.

## Wrap Up

In summary, with KZones, Virtual Desktops, and KWin Scripts, you can put together quite a powerful setup that not only allows you to use a single monitor for work, but also mitigates even the idea of using a second monitor for anything other than a storage closet to keep you focused on the actual task at hand.