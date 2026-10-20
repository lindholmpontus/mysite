# Texture credits

The planet, ring, sun and Milky Way maps in `2k/` and `4k/` are from
[Solar System Scope](https://www.solarsystemscope.com/textures/), licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (based on NASA
mission imagery).

Changes made here: downscaled and re-encoded; Mars desaturated 20% toward its
true-colour look; Earth's cloud and specular maps kept as grayscale; Saturn's
ring map collapsed to a 1D radial profile, un-premultiplied and re-tinted
(blue-grey in the thin C ring / Cassini division, tan in the dense A/B rings).

`milky_way.jpg` keeps only the large-scale structure of their Milky Way
panorama (blurred, point stars removed) and adds procedural star clouds, dust
lanes and colour grading; the crisp stars are drawn live in `Starfield.jsx`.
