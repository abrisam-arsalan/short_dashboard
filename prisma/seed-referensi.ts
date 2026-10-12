/**
 * Seed pustaka referensi — dari koleksi @sifyik (31 gambar AI Video Styles & Prompt Formulas).
 * Jalankan: npx tsx prisma/seed-referensi.ts
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// === 33 Gaya Visual AI Video (Part 1-11) ===
const GAYA_VIDEO = [
  { nomor: 1, nama: "Paper Craft / Stop Motion Layered Diorama", kategori: "stop_motion", deskripsi: "Beautiful stop-motion layered paper diorama video, depth, delicate paper cutouts, warm morning smooth soft lighting, charming handmade aesthetic, detailed textures", kataKunci: JSON.stringify(["paper craft","stop motion","layered diorama","paper cutouts","handmade","warm lighting"]), partSumber: 1 },
  { nomor: 2, nama: "Claymation / Aardman Style", kategori: "stop_motion", deskripsi: "Warm claymation video classic Aardman style, expressive clay characters with fingerprints visible, playful animation, charming lighting, fluid stop-motion feel", kataKunci: JSON.stringify(["claymation","Aardman","clay characters","fingerprints","playful","stop-motion"]), partSumber: 1 },
  { nomor: 3, nama: "3D Pixar Style", kategori: "3d_render", deskripsi: "Rich colorful Pixar-style animation characters, perfect lighting and shading, emotional storytelling, cinematic camera movements", kataKunci: JSON.stringify(["3D Pixar","animated characters","perfect lighting","emotional","cinematic"]), partSumber: 1 },
  { nomor: 4, nama: "Studio Ghibli Anime Style", kategori: "anime", deskripsi: "Magical Studio Ghibli anime style video, lush hand-drawn characters, soft natural lighting, gentle wind movement, heartfelt and dreamy atmosphere", kataKunci: JSON.stringify(["Studio Ghibli","anime","hand-drawn","natural lighting","dreamy","heartfelt"]), partSumber: 2 },
  { nomor: 5, nama: "90s Retro Anime Cel Shading", kategori: "anime", deskripsi: "Nostalgic 90s retro anime with bold cel shading, vibrant colors, dynamic action lines, classic TV anime aesthetic, dramatic lighting", kataKunci: JSON.stringify(["90s retro anime","cel shading","vibrant colors","action lines","dramatic lighting"]), partSumber: 2 },
  { nomor: 6, nama: "Watercolor Illustration", kategori: "illustration", deskripsi: "Flowing watercolor illustration style video, soft brush strokes, gentle transitions, artistic and dreamy movement, paper texture", kataKunci: JSON.stringify(["watercolor","illustration","brush strokes","dreamy","paper texture","artistic"]), partSumber: 2 },
  { nomor: 7, nama: "Ink Wash / Sumi-e Style", kategori: "illustration", deskripsi: "Elegant ink wash sumi-e East Asian brushwork, minimalist black ink on rice paper, fluid expressive strokes, atmospheric and poetic", kataKunci: JSON.stringify(["ink wash","sumi-e","East Asian","brushwork","minimalist","poetic","rice paper"]), partSumber: 3 },
  { nomor: 8, nama: "Flat Vector Illustration", kategori: "illustration", deskripsi: "Clean flat vector illustration video, smooth bold shapes and colors, minimalist design, graphic novel transitions, crisp and modern aesthetic", kataKunci: JSON.stringify(["flat vector","illustration","bold shapes","minimalist","graphic","modern","crisp"]), partSumber: 3 },
  { nomor: 9, nama: "Isometric 3D Render", kategori: "3d_render", deskripsi: "Detailed isometric 3D render video, large perspective camera orbit, technical yet charming style, perfect proportions and lighting", kataKunci: JSON.stringify(["isometric 3D","render","perspective","technical","charming","perfect proportions"]), partSumber: 3 },
  { nomor: 10, nama: "Pixel Art 8-Bit", kategori: "retro", deskripsi: "Retro 8-bit pixel art video, chunky pixels, limited color palette, classic game sprite style, pixel-perfect movements", kataKunci: JSON.stringify(["pixel art","8-bit","retro","chunky pixels","game sprite","limited palette"]), partSumber: 4 },
  { nomor: 11, nama: "Comic Book / Graphic Novel Panels", kategori: "stylized", deskripsi: "Dynamic comic book graphic novel style, panel transitions, bold lines, halftone dots, dramatic camera pushes and zaps", kataKunci: JSON.stringify(["comic book","graphic novel","panel transitions","bold lines","halftone","dramatic"]), partSumber: 4 },
  { nomor: 12, nama: "Noir Black and White Sketch", kategori: "stylized", deskripsi: "Moody noir black and white sketch video, high contrast shadows, detective aesthetic, film grain, stylish cinematic vignette", kataKunci: JSON.stringify(["noir","black and white","sketch","high contrast","film grain","detective","cinematic"]), partSumber: 4 },
  { nomor: 13, nama: "Chalkboard Doodle Style", kategori: "craft", deskripsi: "Fun chalkboard doodle animation, colorful chalk drawings on blackboard, playful bouncy movements, educational feel, whimsical feel", kataKunci: JSON.stringify(["chalkboard","doodle","chalk drawing","playful","educational","whimsical","bouncy"]), partSumber: 5 },
  { nomor: 14, nama: "Felt / Fabric Puppet Style", kategori: "craft", deskripsi: "Charming felt and fabric puppet video, textured materials, handmade puppet storybook theater lighting, tactile atmosphere", kataKunci: JSON.stringify(["felt","fabric puppet","handmade","storybook","theater lighting","tactile","textured"]), partSumber: 5 },
  { nomor: 15, nama: "LEGO Brick Style", kategori: "craft", deskripsi: "Fun LEGO brick animation, colorful plastic bricks and pieces, stop-motion style with perfect brick physics, playful and vibrant", kataKunci: JSON.stringify(["LEGO","brick animation","plastic bricks","stop-motion","playful","colorful","construction"]), partSumber: 5 },
  { nomor: 16, nama: "Origami Paper Fold Style", kategori: "craft", deskripsi: "Elegant origami paper folding video, crisp paper textures, smooth fold animations, clean and precise movements, minimalist aesthetic", kataKunci: JSON.stringify(["origami","paper folding","crisp","smooth","minimalist","precise","elegant"]), partSumber: 6 },
  { nomor: 17, nama: "Low Poly 3D", kategori: "3d_render", deskripsi: "Faceted low poly 3D video, vibrant geometric colors, dramatic camera angles, modern minimalist smooth 3D aesthetic", kataKunci: JSON.stringify(["low poly","3D","geometric","faceted","vibrant","modern","minimalist"]), partSumber: 6 },
  { nomor: 18, nama: "Claymorphism Soft 3D", kategori: "3d_render", deskripsi: "Soft 3D style organic shapes, gentle shadows, pastel colors, friendly and tactile 3D animation", kataKunci: JSON.stringify(["claymorphism","soft 3D","organic shapes","pastel","friendly","tactile","gentle shadows"]), partSumber: 6 },
  { nomor: 19, nama: "Realistic Cinematic Live Action Look", kategori: "stylized", deskripsi: "Hyper-realistic cinematic live-action video, filmic lighting, depth of field, Hollywood quality production", kataKunci: JSON.stringify(["realistic","cinematic","live-action","filmic","Hollywood","depth of field","hyper-realistic"]), partSumber: 7 },
  { nomor: 20, nama: "Pixar-Disney Hybrid", kategori: "3d_render", deskripsi: "Magical Pixar-Disney hybrid animation, heartwarming characters, lush lighting, perfect blend of both studios' signature styles", kataKunci: JSON.stringify(["Pixar-Disney","hybrid animation","heartwarming","lush lighting","magical","signature styles"]), partSumber: 7 },
  { nomor: 21, nama: "South Park Cutout Style", kategori: "stylized", deskripsi: "Hilarious South Park cutout simple paper style, simple shapes, movements, satirical vibe, bright colors and bold outlines", kataKunci: JSON.stringify(["South Park","cutout","paper style","satirical","simple shapes","bright colors","bold outlines"]), partSumber: 7 },
  { nomor: 22, nama: "Crayon / Kids Drawing Style", kategori: "craft", deskripsi: "Playful crayon and kids drawing style video, wobbly lines, bright energetic colors, innocent movements, textured paper background", kataKunci: JSON.stringify(["crayon","kids drawing","wobbly lines","bright colors","innocent","textured paper","playful"]), partSumber: 8 },
  { nomor: 23, nama: "Vintage Travel Poster Style", kategori: "retro", deskripsi: "Nostalgic vintage travel poster illustration animation, warm sepia elements, classic typography, advertising feel", kataKunci: JSON.stringify(["vintage travel","poster","sepia","classic typography","nostalgic","advertising","retro illustration"]), partSumber: 8 },
  { nomor: 24, nama: "Cyberpunk Neon 3D", kategori: "3d_render", deskripsi: "Futuristic cyberpunk neon 3D video, glowing neon lights, rainy reflections, dark moody atmosphere, Blade Runner aesthetics", kataKunci: JSON.stringify(["cyberpunk","neon 3D","glowing lights","rainy reflections","dark moody","Blade Runner","futuristic"]), partSumber: 8 },
  { nomor: 25, nama: "Fantasy Storybook Illustration", kategori: "illustration", deskripsi: "Illustration fairy rich detailed drawings, magical glowing scenes, whimsical illustrated worlds", kataKunci: JSON.stringify(["fantasy","storybook","illustration","magical","detailed drawings","whimsical","glowing"]), partSumber: 9 },
  { nomor: 26, nama: "Stop Motion Felt Puppet (Coraline Style)", kategori: "stop_motion", deskripsi: "Stop-motion felt puppet-style textured fabrics, felt puppets, dark atmsophere lighting", kataKunci: JSON.stringify(["stop motion","felt puppet","Coraline","textured fabrics","dark atmosphere","detailed fabrics"]), partSumber: 9 },
  { nomor: 27, nama: "Minimalist Line Art", kategori: "illustration", deskripsi: "Clean minimalist line art animation, elegant fluid lines, modern sophisticated aesthetic", kataKunci: JSON.stringify(["minimalist","line art","elegant","fluid lines","modern","sophisticated","clean"]), partSumber: 9 },
  { nomor: 28, nama: "Sticker Style Bold Outline", kategori: "stylized", deskripsi: "Fun sticker-style animation with bold black outlines, playful bouncing 3D moves, social media ready", kataKunci: JSON.stringify(["sticker style","bold outline","playful","bouncing","social media","fun","3D moves"]), partSumber: 10 },
  { nomor: 29, nama: "Sand Animation Style", kategori: "craft", deskripsi: "Mesmerizing sand animation video, grains of sand forming scenes, smooth transitions, artistic and hypnotic flow", kataKunci: JSON.stringify(["sand animation","grains","smooth transitions","hypnotic","artistic","mesmerizing","flowing"]), partSumber: 10 },
  { nomor: 30, nama: "Wood Carving / Whittled Figure Style", kategori: "craft", deskripsi: "Rustic wood carving animation, detailed wooden figures, natural wood textures, warm lighting, folk art charm", kataKunci: JSON.stringify(["wood carving","whittled","wooden figures","natural textures","folk art","warm lighting","rustic"]), partSumber: 10 },
  { nomor: 31, nama: "Glass and Light 3D Render", kategori: "3d_render", deskripsi: "Stunning glass and light 3D render video, transparent glass elements, refractive caustics, elegant light beams, beautiful chromatic modern look", kataKunci: JSON.stringify(["glass","light 3D","transparent","refractive","caustics","elegant","chromatic","modern"]), partSumber: 11 },
  { nomor: 32, nama: "Pastel Dreamy 3D Render", kategori: "3d_render", deskripsi: "Soft pastel dreamy 3D render video, gentle 3D renders, fluffy clouds, ethereal lighting, calming and whimsical atmosphere", kataKunci: JSON.stringify(["pastel","dreamy 3D","soft","fluffy clouds","ethereal","calming","whimsical"]), partSumber: 11 },
  { nomor: 33, nama: "Retro 90s Plastic Toy 3D Style", kategori: "retro", deskripsi: "Classic mid-1990s computer-era 3D plastic toy texture, nostalgic lighting, pixelated animation charm", kataKunci: JSON.stringify(["retro 90s","plastic toy","3D","nostalgic","pixelated","computer-era","classic"]), partSumber: 11 },
];

// === 100 Prompt Formula (dari gambar Part 1-10) ===
const FORMULA_PROMPT = [
  // Cinematic Story Shots (1-10)
  { nomor: 1, nama: "Rain City Walk", kategori: "cinematic", formulaPrompt: "Prompt: Rain-soaked alley walk at night, neon reflections on wet pavement, film grain, shallow depth of field, cinematic lighting, panning shot, atmospheric mist. Audio: rain sounds, distant thunder, soft footsteps.", detailAudio: "rain, thunder, footsteps", partSumber: 1 },
  { nomor: 2, nama: "Sunrise Village Reveal", kategori: "cinematic", formulaPrompt: "Prompt: Wide static shot reveals a serene misty village at sunrise, camera slowly rising, warm golden haze, cinematic atmosphere, soft ambient lighting. Audio: gentle birdsong, distant bells, soft breeze.", detailAudio: "birdsong, bells, breeze", partSumber: 1 },
  { nomor: 3, nama: "Match Strike & Gentle Reveal", kategori: "cinematic", formulaPrompt: "Prompt: Extreme close-up of a match strike in darkness, warm light blooms into a cozy candlelit scene, slow push-in, film grain, rich shadows, moody atmosphere. Audio: match strike, soft fire crackling, quiet room tone.", detailAudio: "match strike, fire crackling", partSumber: 1 },
  { nomor: 4, nama: "Coastal Drive Golden Hour", kategori: "cinematic", formulaPrompt: "Prompt: Tracking shot along a vintage convertible on a coastal highway, golden hour light, lens flare, wind in hair, handheld camera, warm nostalgic tones. Audio: ocean waves, engine purr, soft guitar music.", detailAudio: "ocean waves, engine, guitar", partSumber: 1 },
  { nomor: 5, nama: "Space Station Emergency Push", kategori: "cinematic", formulaPrompt: "Prompt: Slow push-in on a tense space station corridor, flickering lights, spinning warning lights, crew drifting, dramatic cinematic score, sci-fi atmosphere. Audio: alarm beeps, metallic echoes, low hum.", detailAudio: "alarm, metallic, hum", partSumber: 1 },
  { nomor: 6, nama: "Subway Violin Underpass", kategori: "cinematic", formulaPrompt: "Prompt: Handheld follow shot of a violinist in a subway underpass, harsh fluorescent lighting, ambient city sounds, film grain, realistic gritty atmosphere. Audio: violin melody, subway rumble, footsteps echoing.", detailAudio: "violin, subway, footsteps", partSumber: 1 },
  { nomor: 7, nama: "Vintage Mirror Shatter Reveal", kategori: "cinematic", formulaPrompt: "Prompt: Wide static shot reveals an antique mirror shattering, glass fragments floating, dramatic lighting, slow motion, cinematic depth, reflective surfaces. Audio: glass shattering, ethereal tones, soft whisper.", detailAudio: "glass shatter, ethereal, whisper", partSumber: 1 },
  { nomor: 8, nama: "Empty Theater Curtain Open", kategori: "cinematic", formulaPrompt: "Prompt: Extreme wide shot of an empty theater, red curtain slowly opens revealing stage light, gentle dust motes, cinematic mood, soft ambient lighting. Audio: curtain swish, distant orchestra warming up, soft applause.", detailAudio: "curtain, orchestra, applause", partSumber: 1 },
  { nomor: 9, nama: "Firefighter Smoke Walk", kategori: "cinematic", formulaPrompt: "Prompt: Low angle tracking shot follows a firefighter through thick smoke, dramatic backlighting, embers floating, gritty cinematic, tense atmosphere. Audio: crackling fire, breathing apparatus, radio chatter.", detailAudio: "fire, breathing, radio", partSumber: 1 },
  { nomor: 10, nama: "Station Reunion Circle Shot", kategori: "cinematic", formulaPrompt: "Prompt: 360-degree orbit shot of emotional reunion at a train station, golden backlight through steam, lens flare, soft focus edges, cinematic warmth. Audio: train announcement, soft music, emotional swell.", detailAudio: "train, music, emotional", partSumber: 1 },
  // Viral Scroll Stoppers (11-20)
  { nomor: 11, nama: "Tiny Chef Giant Pancake", kategori: "viral", formulaPrompt: "Prompt: Vertical macro shot of tiny chef flipping giant pancake, high detail, warm kitchen lighting, shallow DOF, crisp focus. Audio: sizzle, tiny voice, whimsical music.", detailAudio: "sizzle, voice, whimsical", partSumber: 2 },
  { nomor: 12, nama: "Street Noodle Sizzle Reel", kategori: "viral", formulaPrompt: "Prompt: Vertical close-up of street noodles being tossed in wok, steam rising, sizzling oil, cinematic slow motion, vibrant colors, shallow DOF. Audio: sizzle, chopsticks clinking, street ambience.", detailAudio: "sizzle, chopsticks, street", partSumber: 2 },
  { nomor: 13, nama: "Bedroom to Gaming Room Snap", kategori: "viral", formulaPrompt: "Prompt: Vertical fast transition from messy bedroom to epic gaming room, energetic lighting shift, upbeat vibe, fast camera, RGB glow. Audio: whoosh, bass drop, keyboard clicks.", detailAudio: "whoosh, bass, keyboard", partSumber: 2 },
  { nomor: 14, nama: "Hidden Waterfall Hike Reveal", kategori: "viral", formulaPrompt: "Prompt: Vertical POV hiking through jungle, pushing aside vines to reveal hidden waterfall, dramatic reveal, natural lighting, lush colors. Audio: jungle birds, rushing water, footsteps on leaves.", detailAudio: "birds, water, footsteps", partSumber: 2 },
  { nomor: 15, nama: "Electronic Outfit Transformation", kategori: "viral", formulaPrompt: "Prompt: Vertical outfit transition with electronic glow, neon light trails, futuristic fashion, stylish cool lighting, dynamic camera. Audio: electronic beat, fabric swish, synth stabs.", detailAudio: "electronic, fabric, synth", partSumber: 2 },
  { nomor: 16, nama: "Molten Glass Sculpt Close-Up", kategori: "viral", formulaPrompt: "Prompt: Extreme close-up of molten glass being shaped, glowing orange, sparks, fiery reflections, artistic detail, shallow DOF. Audio: furnace roar, glass tinkling, tools clinking.", detailAudio: "furnace, glass, tools", partSumber: 2 },
  { nomor: 17, nama: "Talking Mug Motivation Skit", kategori: "viral", formulaPrompt: "Prompt: Vertical comedic talking coffee mug giving life advice, silly faces, warm kitchen lighting, shallow DOF, quirky charm. Audio: mug voice, coffee pouring, background chatter.", detailAudio: "mug voice, coffee, chatter", partSumber: 2 },
  { nomor: 18, nama: "Rusty Bike Restore Reel", kategori: "viral", formulaPrompt: "Prompt: Vertical before/after rust bike restoration, gritty to polished, transformation, workshop lighting, satisfying. Audio: sanding, spray paint, wrench turning.", detailAudio: "sanding, spray, wrench", partSumber: 2 },
  { nomor: 19, nama: "Rain City Electric Car Glow", kategori: "viral", formulaPrompt: "Prompt: Vertical car reveal in rain city at night, electric car glowing, neon reflections, dramatic lighting, cinematic. Audio: rain, car hum, city ambience.", detailAudio: "rain, car, city", partSumber: 2 },
  { nomor: 20, nama: "Robot Street Food Reel", kategori: "viral", formulaPrompt: "Prompt: Vertical robot serving street food, futuristic kitchen, steam and sparks, vibrant colors, dynamic camera. Audio: robot whirring, sizzling food, crowd noise.", detailAudio: "robot, sizzle, crowd", partSumber: 2 },
  // Brand & Ad Shots (21-30)
  { nomor: 21, nama: "Sneaker Unbox to Run", kategori: "brand", formulaPrompt: "Prompt: Premium product unboxing sneaker, transitioning to runner on track, dynamic camera, glossy studio lighting, high energy. Audio: box opening, shoe swoosh, running footsteps, upbeat music.", detailAudio: "box, swoosh, running", partSumber: 3 },
  { nomor: 22, nama: "Coffee Bean Origin", kategori: "brand", formulaPrompt: "Prompt: Cinematic journey of coffee bean from farm to espresso cup, warm golden tones, shallow DOF, slow motion, luxury feel. Audio: birds, roasting, coffee pour, jazz.", detailAudio: "birds, roast, pour, jazz", partSumber: 3 },
  { nomor: 23, nama: "Smartwatch Dash Reveal", kategori: "brand", formulaPrompt: "Prompt: Smartwatch product ad where a runner's heartbeat syncs with data visuals on screen, clean modern look, dynamic lighting, tech feel. Audio: heartbeat, digital beeps, energetic music.", detailAudio: "heartbeat, beeps, music", partSumber: 3 },
  { nomor: 24, nama: "Perfume Bottle Mountain", kategori: "brand", formulaPrompt: "Prompt: Luxury perfume ad with glass bottle on mountain, water cascading, golden hour light, elegant slow camera, premium feel. Audio: water flow, soft strings, wind.", detailAudio: "water, strings, wind", partSumber: 3 },
  { nomor: 25, nama: "Sneaker Paint Stroke", kategori: "brand", formulaPrompt: "Prompt: Hand painting sneaker design, close-up brushstrokes, colorful vibrant palette, studio lighting, artistic creative feel. Audio: brush strokes, spray can, upbeat music.", detailAudio: "brush, spray, music", partSumber: 3 },
  { nomor: 26, nama: "Can to Mountain Splash", kategori: "brand", formulaPrompt: "Prompt: Beverage can opening to mountain fresh splash, water droplets, dynamic camera, crisp lighting, refreshing feel. Audio: can pop, splash, mountain breeze.", detailAudio: "pop, splash, breeze", partSumber: 3 },
  { nomor: 27, nama: "Living Room Skyline Ads", kategori: "brand", formulaPrompt: "Prompt: Living room transforms into a city skyline view, smooth transition, warm ambient lighting, modern home feel. Audio: room tone, city sounds, gentle music.", detailAudio: "room, city, music", partSumber: 3 },
  { nomor: 28, nama: "Headphone Quiet to Loud", kategori: "brand", formulaPrompt: "Prompt: Headphone ad with world going quiet then music hitting, visual sound waves, clean studio look, immersive audio experience. Audio: silence then bass drop, music, sound effects.", detailAudio: "silence, bass, music", partSumber: 3 },
  { nomor: 29, nama: "Car Reveal in Studio", kategori: "brand", formulaPrompt: "Prompt: Cinematic car reveal in studio, paint gleaming under lights, slow rotation, luxury commercial look, dramatic lighting. Audio: engine rev, light hum, orchestral hit.", detailAudio: "engine, hum, orchestra", partSumber: 3 },
  { nomor: 30, nama: "Sand to Plate Art", kategori: "brand", formulaPrompt: "Prompt: Sand sculpting food art, detailed textures, warm beach lighting, artistic macro shots, creative culinary feel. Audio: sand grains, ocean waves, soft music.", detailAudio: "sand, waves, music", partSumber: 3 },
  // Product & Tech Shots (31-40)
  { nomor: 31, nama: "Rotating Phone Studio", kategori: "product", formulaPrompt: "Prompt: Smart product 360 phone rotating on dark studio surface, screen glow, premium reflections, sleek modern tech. Audio: subtle whoosh, electronic hum, minimal beat.", detailAudio: "whoosh, hum, beat", partSumber: 4 },
  { nomor: 32, nama: "Holographic Desk Device", kategori: "product", formulaPrompt: "Prompt: Futuristic holographic desk device projecting 3D data, cool blue glow, smooth camera orbit, electronic hum, sci-fi tech. Audio: digital beeps, hum, data processing sounds.", detailAudio: "beeps, hum, data", partSumber: 4 },
  { nomor: 33, nama: "Floating Headphones Particles", kategori: "product", formulaPrompt: "Prompt: Studio shot of floating headphones with particles, dark studio, dramatic rim lighting, ear cushion detail, premium product. Audio: soft whoosh, bass thump, ambient pad.", detailAudio: "whoosh, bass, ambient", partSumber: 4 },
  { nomor: 34, nama: "Mechanical Keyboard Build", kategori: "product", formulaPrompt: "Prompt: Mechanical keyboard assembly time-lapse, macro shots of switches, colorful RGB, workspace lighting, tech enthusiast feel. Audio: click clack, switch snaps, lo-fi beat.", detailAudio: "clicks, snaps, lo-fi", partSumber: 4 },
  { nomor: 35, nama: "Transparent Laptop Power", kategori: "product", formulaPrompt: "Prompt: Transparent laptop powering on with glowing internals, neon circuitry, dark room, premium minimal look. Audio: power up hum, electronic chirps, subtle bass.", detailAudio: "hum, chirps, bass", partSumber: 4 },
  { nomor: 36, nama: "Smart Home Voice Response", kategori: "product", formulaPrompt: "Prompt: Smart home device responding to voice, ambient room lighting shifts, modern interior, voice activated mood. Audio: voice command, chime, gentle automation sounds.", detailAudio: "voice, chime, automation", partSumber: 4 },
  { nomor: 37, nama: "Drill Cam Descent", kategori: "product", formulaPrompt: "Prompt: POV camera descending on drone, city lights below, cool night atmosphere, smooth gimbal movement, tech adventure. Audio: propeller hum, wind, city ambience.", detailAudio: "propeller, wind, city", partSumber: 4 },
  { nomor: 38, nama: "Luxury Robot Vacuum", kategori: "product", formulaPrompt: "Prompt: Luxury robot vacuum navigating marble floor, soft reflections, clean modern interior, gentle ambient lighting. Audio: soft motor, chime, clean house ambience.", detailAudio: "motor, chime, ambience", partSumber: 4 },
  { nomor: 39, nama: "Hologram Tablet 3D Draw", kategori: "product", formulaPrompt: "Prompt: Holographic tablet interface with 3D drawing, glowing hologram, futuristic workspace, tech product feel. Audio: holographic chime, drawing sounds, futuristic hum.", detailAudio: "chime, drawing, hum", partSumber: 4 },
  { nomor: 40, nama: "Minimalist Projector 3D", kategori: "product", formulaPrompt: "Prompt: Minimalist projector casting 3D model, ambient room glow, smooth transitions, premium product showcase. Audio: projector hum, soft click, ambient music.", detailAudio: "hum, click, music", partSumber: 4 },
  // Food & ASMR Shots (41-50)
  { nomor: 41, nama: "Chocolate Macro Pour", kategori: "food", formulaPrompt: "Prompt: Macro shot of melted chocolate pouring over warm cake, rich warm lighting, glossy texture, slow-mo drip, extreme detail. Audio: chocolate pour, soft kitchen ambience, gentle music.", detailAudio: "pour, kitchen, music", partSumber: 5 },
  { nomor: 42, nama: "Strawberry Chocolate Dip", kategori: "food", formulaPrompt: "Prompt: Fresh strawberry dipped in melted chocolate, close-up, warm golden light, romantic feel, soft focus. Audio: gentle chocolate swirl, soft jazz, subtle crack.", detailAudio: "swirl, jazz, crack", partSumber: 5 },
  { nomor: 43, nama: "Steaming Ramen Lift", kategori: "food", formulaPrompt: "Prompt: Bowl of steaming ramen with chopsticks lifting noodles, warm broth glow, soft steam, cozy kitchen lighting, comforting. Audio: slurping, steam, kitchen ambience.", detailAudio: "slurp, steam, kitchen", partSumber: 5 },
  { nomor: 44, nama: "Croissant Layer Bake", kategori: "food", formulaPrompt: "Prompt: Golden bakery oven pulling fresh croissant layers, crispy flaky texture, warm morning light, artisan feel. Audio: oven door, crunch, bakery ambience.", detailAudio: "oven, crunch, bakery", partSumber: 5 },
  { nomor: 45, nama: "Rhythmic Mango Slice", kategori: "food", formulaPrompt: "Prompt: Rhythmic mango slicing, juicy vibrant color, kitchen natural lighting, tropical feel, ASMR style. Audio: knife chopping, juice squish, tropical music.", detailAudio: "chopping, squish, tropical", partSumber: 5 },
  { nomor: 46, nama: "Sushi Precision Build", kategori: "food", formulaPrompt: "Prompt: Fresh sushi assembly piece by piece, precise chef hands, clean modern lighting, Japanese aesthetic. Audio: rice pats, knife cuts, zen ambience.", detailAudio: "rice, knife, zen", partSumber: 5 },
  { nomor: 47, nama: "Ice Cream Over Scoop", kategori: "food", formulaPrompt: "Prompt: Ice cream scoop melting over warm pie, creamy texture close-up, warm summer lighting, nostalgic dessert feel. Audio: scooping, melting drip, summer music.", detailAudio: "scoop, drip, summer", partSumber: 5 },
  { nomor: 48, nama: "Pizza Pull Cheese", kategori: "food", formulaPrompt: "Prompt: Fresh pizza pulled from wood oven, cheese stretch, crispy crust, rustic Italian lighting, comfort food. Audio: oven crackle, cheese pull, Italian music.", detailAudio: "crackle, pull, Italian", partSumber: 5 },
  { nomor: 49, nama: "Reveal Steam Bread", kategori: "food", formulaPrompt: "Prompt: Bread breaking open to reveal steam, soft fluffy interior, warm bakery lighting, home-baked feel. Audio: bread crack, steam whoosh, cozy music.", detailAudio: "crack, steam, cozy", partSumber: 5 },
  { nomor: 50, nama: "Plate Pour Fruit", kategori: "food", formulaPrompt: "Prompt: Colorful breakfast plate with fruit pouring honey, morning sunlight, vibrant colors, healthy lifestyle. Audio: honey drizzle, birds chirping, morning music.", detailAudio: "honey, birds, morning", partSumber: 5 },
  // Travel & Nature Shots (51-60)
  { nomor: 51, nama: "Sunrise Island Reveal", kategori: "travel", formulaPrompt: "Prompt: Aerial drone shot of tropical island at sunrise, turquoise water, golden light, peaceful travel vibe, cinematic wide. Audio: ocean waves, seagulls, soft guitar.", detailAudio: "waves, seagulls, guitar", partSumber: 6 },
  { nomor: 52, nama: "Misty Forest Walk", kategori: "travel", formulaPrompt: "Prompt: Slow walking shot through misty forest, god rays through trees, mossy ground, peaceful nature walk, atmospheric. Audio: birds, leaves crunching, gentle wind.", detailAudio: "birds, leaves, wind", partSumber: 6 },
  { nomor: 53, nama: "Iceland Falls Viewpoint", kategori: "travel", formulaPrompt: "Prompt: Wide POV at Iceland waterfall viewpoint, thundering water over cliffs, overcast dramatic sky, epic nature. Audio: thundering water, wind, distant birds.", detailAudio: "water, wind, birds", partSumber: 6 },
  { nomor: 54, nama: "Sunset Road Drive", kategori: "travel", formulaPrompt: "Prompt: Orange desert road stretching to sunset, car driving into golden horizon, warm glow, freedom and adventure. Audio: wind, car engine, acoustic guitar.", detailAudio: "wind, engine, guitar", partSumber: 6 },
  { nomor: 55, nama: "Autumn Garden Pan", kategori: "travel", formulaPrompt: "Prompt: Autumn leaves falling in botanical garden, warm orange and gold, slow pan, peaceful seasonal beauty. Audio: leaves rustling, gentle breeze, piano.", detailAudio: "leaves, breeze, piano", partSumber: 6 },
  { nomor: 56, nama: "Snowy Valley Love", kategori: "travel", formulaPrompt: "Prompt: Snowy mountain valley with two people walking, soft snowfall, romantic winter light, gentle intimacy. Audio: snow crunching, soft wind, emotional strings.", detailAudio: "snow, wind, strings", partSumber: 6 },
  { nomor: 57, nama: "Beach Rainstorm Run", kategori: "travel", formulaPrompt: "Prompt: Dramatic beach rainstorm, waves crashing, dark clouds, person running along shore, wild powerful nature. Audio: thunder, crashing waves, heavy rain.", detailAudio: "thunder, waves, rain", partSumber: 6 },
  { nomor: 58, nama: "Leopard Grass Motion", kategori: "travel", formulaPrompt: "Prompt: Wildlife shot of leopard moving through tall grass, golden hour, intense focus, safari documentary feel. Audio: grass rustling, distant calls, tense music.", detailAudio: "grass, calls, tense", partSumber: 6 },
  { nomor: 59, nama: "Aurora Cabin Magic", kategori: "travel", formulaPrompt: "Prompt: Warm glowing cabin under northern lights, green aurora dancing sky, snowy landscape, magical winter night. Audio: aurora hum, crackling fire, wind chimes.", detailAudio: "aurora, fire, chimes", partSumber: 6 },
  { nomor: 60, nama: "Soul Night Fog Stage", kategori: "travel", formulaPrompt: "Prompt: Foggy night stage with soulful performance, moody atmospheric lighting, intimate venue, soulful music. Audio: soul music, crowd murmur, microphone echo.", detailAudio: "soul, crowd, echo", partSumber: 6 },
  // Fantasy & Sci-Fi Shots (61-70)
  { nomor: 61, nama: "Floating Castle Arrival", kategori: "fantasy", formulaPrompt: "Prompt: Fantasy floating castle among clouds, magical atmosphere, ethereal light, flying arrival, epic fantasy. Audio: magical chimes, wind, orchestral swell.", detailAudio: "chimes, wind, orchestra", partSumber: 7 },
  { nomor: 62, nama: "Oil and Sand Walk", kategori: "fantasy", formulaPrompt: "Prompt: Character walking through swirling oil and sand landscape, surreal environment, vibrant colors, dreamlike motion. Audio: swirling winds, deep bass, ethereal tones.", detailAudio: "wind, bass, ethereal", partSumber: 7 },
  { nomor: 63, nama: "Rain Metallic Steps", kategori: "fantasy", formulaPrompt: "Prompt: Futuristic rain on metallic steps, reflective surfaces, cyberpunk mood, dark cinematic, sci-fi atmosphere. Audio: rain on metal, distant sirens, synth pad.", detailAudio: "rain, sirens, synth", partSumber: 7 },
  { nomor: 64, nama: "Dragon Frozen Landing", kategori: "fantasy", formulaPrompt: "Prompt: Giant dragon landing on frozen ridge, ice particles, dramatic scale, epic fantasy, powerful wind. Audio: dragon roar, ice cracking, powerful drums.", detailAudio: "roar, ice, drums", partSumber: 7 },
  { nomor: 65, nama: "Alien Desert Reveal", kategori: "fantasy", formulaPrompt: "Prompt: Alien desert reveal with floating rocks and glowing plants, sci-fi landscape, mysterious atmosphere, otherworldly. Audio: alien ambience, low hum, mysterious tones.", detailAudio: "alien, hum, mystery", partSumber: 7 },
  { nomor: 66, nama: "Giant Tree of Life", kategori: "fantasy", formulaPrompt: "Prompt: Massive glowing tree of life in enchanted forest, magical light particles, fantasy nature, awe-inspiring scale. Audio: magical shimmer, forest sounds, epic strings.", detailAudio: "shimmer, forest, strings", partSumber: 7 },
  { nomor: 67, nama: "Crystal Flower Weave", kategori: "fantasy", formulaPrompt: "Prompt: Crystal flower blooming in icy cave, sparkling light refractions, fantasy delicate beauty, magical detail. Audio: crystal chimes, soft wind, enchanting melody.", detailAudio: "chimes, wind, melody", partSumber: 7 },
  { nomor: 68, nama: "Oceanic Whale Sky", kategori: "fantasy", formulaPrompt: "Prompt: Giant whale swimming through oceanic sky, dreamlike fantasy world, soft clouds, majestic gentle giant. Audio: whale song, gentle waves, dreamy music.", detailAudio: "whale, waves, dreamy", partSumber: 7 },
  { nomor: 69, nama: "Floating Book Library", kategori: "fantasy", formulaPrompt: "Prompt: Magical floating book library, glowing pages, ancient knowledge, fantasy atmosphere, enchanted wisdom. Audio: page turning, magical hum, soft whisper.", detailAudio: "pages, hum, whisper", partSumber: 7 },
  { nomor: 70, nama: "Castle City Portal", kategori: "fantasy", formulaPrompt: "Prompt: Castle city seen through magical portal, swirling energy, fantasy gateway, epic world beyond, dramatic. Audio: portal whoosh, magical energy, epic music.", detailAudio: "portal, energy, epic", partSumber: 7 },
  // Anime & Stylized Shots (71-80)
  { nomor: 71, nama: "Anime Rooftop Sunset", kategori: "anime", formulaPrompt: "Prompt: Anime rooftop sunset scene, wind blowing hair, golden hour glow, nostalgic emotional atmosphere, cel animation. Audio: gentle breeze, school bell, emotional piano.", detailAudio: "breeze, bell, piano", partSumber: 8 },
  { nomor: 72, nama: "Train Window Anime", kategori: "anime", formulaPrompt: "Prompt: Anime train window with reflections, scenic countryside passing, soft afternoon light, reflective mood, Studio Ghibli feel. Audio: train rhythm, gentle music, countryside sounds.", detailAudio: "train, music, countryside", partSumber: 8 },
  { nomor: 73, nama: "Glowing Field Warrior", kategori: "anime", formulaPrompt: "Prompt: Anime warrior running through glowing field, dynamic action, bright colors, energetic movement, shonen anime style. Audio: running footsteps, battle music, energy surge.", detailAudio: "footsteps, battle, energy", partSumber: 8 },
  { nomor: 74, nama: "Quiet Cafe Rain", kategori: "anime", formulaPrompt: "Prompt: Anime quiet cafe scene in rain, warm indoor lighting, cozy atmosphere, reflective moment, slice of life. Audio: rain on window, coffee stirring, soft jazz.", detailAudio: "rain, coffee, jazz", partSumber: 8 },
  { nomor: 75, nama: "Neon Walk Stylized", kategori: "anime", formulaPrompt: "Prompt: Stylized neon city walk, anime-inspired, vibrant colors, urban atmosphere, futuristic vibes, synthwave feel. Audio: synth music, city ambience, footsteps.", detailAudio: "synth, city, footsteps", partSumber: 8 },
  { nomor: 76, nama: "Moon Base Departure", kategori: "anime", formulaPrompt: "Prompt: Anime moon base departure scene, vast space background, dramatic lighting, sci-fi anime atmosphere, emotional. Audio: spaceship hum, dramatic score, radio static.", detailAudio: "spaceship, score, radio", partSumber: 8 },
  { nomor: 77, nama: "Ghibli Giant Bowl", kategori: "anime", formulaPrompt: "Prompt: Studio Ghibli-style cooking scene with giant bowl, warm food details, cozy kitchen, charming hand-drawn, comforting. Audio: cooking sounds, happy chatter, warm music.", detailAudio: "cooking, chatter, music", partSumber: 8 },
  { nomor: 78, nama: "Waterfall Fantasy Serene", kategori: "anime", formulaPrompt: "Prompt: Anime waterfall meditation scene, serene fantasy, glowing light, peaceful atmosphere, spiritual calm. Audio: waterfall, gentle wind, zen bells.", detailAudio: "waterfall, wind, bells", partSumber: 8 },
  { nomor: 79, nama: "Samurai Walk Stylized", kategori: "anime", formulaPrompt: "Prompt: Stylized samurai walking through misty bamboo, dramatic atmosphere, Japanese aesthetic, powerful quiet energy. Audio: bamboo rustling, footsteps, tense strings.", detailAudio: "bamboo, footsteps, strings", partSumber: 8 },
  { nomor: 80, nama: "Neon Arcade Retro", kategori: "anime", formulaPrompt: "Prompt: Retro anime neon arcade scene, vibrant colors, nostalgic gaming atmosphere, electric energy, 80s vibes. Audio: arcade sounds, synth music, coin drops.", detailAudio: "arcade, synth, coins", partSumber: 8 },
  // Comedy & Story Shots (81-90)
  { nomor: 81, nama: "Houseplant Office Skit", kategori: "comedy", formulaPrompt: "Prompt: Comedy skit office worker discovers houseplant is their boss, funny timing, bright office lighting, sitcom feel. Audio: funny sound effects, office ambience, laughter.", detailAudio: "effects, office, laughter", partSumber: 9 },
  { nomor: 82, nama: "Cat CEO Board Report", kategori: "comedy", formulaPrompt: "Prompt: A cat in a suit doing boardroom presentation, deadpan humor, corporate setting, funny animal comedy. Audio: meowing, boardroom ambience, funny music.", detailAudio: "meow, boardroom, funny", partSumber: 9 },
  { nomor: 83, nama: "Knight Drive-Thru Order", kategori: "comedy", formulaPrompt: "Prompt: Medieval knight at drive-thru ordering food, absurd comedy, anachronistic humor, funny contrast. Audio: horse neighing, drive-thru speaker, comedy music.", detailAudio: "horse, speaker, comedy", partSumber: 9 },
  { nomor: 84, nama: "Midnight Cake Heist", kategori: "comedy", formulaPrompt: "Prompt: Dad sneaking midnight cake, caught by family, funny reaction, warm kitchen lighting, family comedy. Audio: fridge opening, giggles, suspense music.", detailAudio: "fridge, giggles, suspense", partSumber: 9 },
  { nomor: 85, nama: "Robot Chef Disaster", kategori: "comedy", formulaPrompt: "Prompt: Robot chef making a mess in kitchen, funny disaster, modern kitchen, slapstick comedy, chaos. Audio: crash, robot beeps, funny sound effects.", detailAudio: "crash, beeps, funny", partSumber: 9 },
  { nomor: 86, nama: "Superhero Coffee Order", kategori: "comedy", formulaPrompt: "Prompt: Superhero ordering coffee at cafe, everyday problems, funny contrast, warm cafe lighting, relatable comedy. Audio: coffee machine, superhero theme, casual chatter.", detailAudio: "coffee, theme, chatter", partSumber: 9 },
  { nomor: 87, nama: "Dog Meets Mirror", kategori: "comedy", formulaPrompt: "Prompt: First time dog sees mirror reflection, funny reaction, cute pet comedy, warm home lighting, adorable. Audio: dog barking, funny music, tail wagging.", detailAudio: "barking, music, wagging", partSumber: 9 },
  { nomor: 88, nama: "Pirate Phone Treasure", kategori: "comedy", formulaPrompt: "Prompt: Pirate trying to use smartphone for treasure map, fish-out-of-water comedy, nautical setting, funny. Audio: seagulls, pirate voice, funny sound effects.", detailAudio: "seagulls, voice, effects", partSumber: 9 },
  { nomor: 89, nama: "Time Loop Monday", kategori: "comedy", formulaPrompt: "Prompt: Office worker stuck in time loop of Monday, surreal comedy, repeated actions, funny frustration, surreal. Audio: clock ticking, funny music, office sounds.", detailAudio: "clock, music, office", partSumber: 9 },
  { nomor: 90, nama: "Kitten Interrupts Vlog", kategori: "comedy", formulaPrompt: "Prompt: Kitten interrupting vlog recording, cute funny moment, vlog setup, warm lighting, adorable comedy. Audio: meowing, giggles, soft background music.", detailAudio: "meow, giggles, music", partSumber: 9 },
  // Dialogue & Mood Shots (91-100)
  { nomor: 91, nama: "Interrogation Question", kategori: "dialogue", formulaPrompt: "Prompt: Dialogue-focused shot in an interrogation room, tense questioning, low-key dramatic lighting, suspenseful mood. Audio: echoing dialogue, ticking clock, tense ambience.", detailAudio: "dialogue, clock, tense", partSumber: 10 },
  { nomor: 92, nama: "Old Friends Table Talk", kategori: "dialogue", formulaPrompt: "Prompt: Two old friends talking at a table, warm bar lighting, emotional storytelling, intimate mood, deep conversation. Audio: soft background chatter, drinks pouring, emotional music.", detailAudio: "chatter, drinks, music", partSumber: 10 },
  { nomor: 93, nama: "30-Second Cockpit", kategori: "dialogue", formulaPrompt: "Prompt: 30-second cockpit countdown monologue, tense dialogue, dramatic cockpit lighting, intense mood, countdown tension. Audio: radio chatter, alarms, heartbeat.", detailAudio: "radio, alarms, heartbeat", partSumber: 10 },
  { nomor: 94, nama: "Vendor Street Reaction", kategori: "dialogue", formulaPrompt: "Prompt: Street vendor reaction to a food critic, comedic dialogue, vibrant street market, expressive faces, lively. Audio: street market sounds, laughter, food sizzle.", detailAudio: "market, laughter, sizzle", partSumber: 10 },
  { nomor: 95, nama: "Dough Knows Secret", kategori: "dialogue", formulaPrompt: "Prompt: Person whispering secret to dough as it rises, absurd comedy, warm kitchen lighting, funny mood, quirky. Audio: whispering, oven ticking, funny music.", detailAudio: "whisper, oven, funny", partSumber: 10 },
  { nomor: 96, nama: "City Keeps Secrets", kategori: "dialogue", formulaPrompt: "Prompt: Voice-over monologue walking through the dark city, atmospheric rain, noir detective mood, reflective monologue. Audio: rain, footsteps, low voice-over.", detailAudio: "rain, footsteps, voice", partSumber: 10 },
  { nomor: 97, nama: "Three Touchdown Huddle", kategori: "dialogue", formulaPrompt: "Prompt: Team huddle before the final play, motivational speech, dramatic stadium lighting, intense focus, team spirit. Audio: crowd noise, coach's voice, heartbeat.", detailAudio: "crowd, voice, heartbeat", partSumber: 10 },
  { nomor: 98, nama: "Every Step View", kategori: "dialogue", formulaPrompt: "Prompt: Walking shot following a character's every step, dramatic inner voice, urban setting, introspective mood, cinematic. Audio: footsteps, city ambience, emotional score.", detailAudio: "footsteps, city, score", partSumber: 10 },
  { nomor: 99, nama: "Simple Made Says", kategori: "dialogue", formulaPrompt: "Prompt: Chef presenting a simple dish with powerful words, warm kitchen lighting, food philosophy, heartfelt delivery. Audio: kitchen ambience, gentle music, heartfelt speech.", detailAudio: "kitchen, music, speech", partSumber: 10 },
  { nomor: 100, nama: "Sandwich Breakfast Duel", kategori: "dialogue", formulaPrompt: "Prompt: Two people debating sandwich vs cereal for breakfast, funny kitchen debate, bright morning lighting, casual humor. Audio: morning sounds, funny banter, upbeat music.", detailAudio: "morning, banter, music", partSumber: 10 },
];

// === 50 Faceless YouTube AI Channel Ideas ===
const IDE_CHANNEL = [
  { nomor: 1, nama: "AI Revolution Daily", kategori: "tech", deskripsi: "Daily updates on AI breakthroughs and tools" },
  { nomor: 2, nama: "Uncovered Histories", kategori: "education", deskripsi: "Forgotten historical events told with AI visuals" },
  { nomor: 3, nama: "The AI GRID", kategori: "tech", deskripsi: "Explainer series on how AI systems work" },
  { nomor: 4, nama: "Skill Leap", kategori: "education", deskripsi: "Quick skill tutorials with AI-generated visuals" },
  { nomor: 5, nama: "Moral Papers", kategori: "education", deskripsi: "Breaking down research papers into simple insights" },
  { nomor: 6, nama: "AI Advice Hub", kategori: "lifestyle", deskripsi: "AI-powered life tips and productivity hacks" },
  { nomor: 7, nama: "Future Stuff", kategori: "tech", deskripsi: "Emerging technology and future predictions" },
  { nomor: 8, nama: "Simple Explainers", kategori: "education", deskripsi: "Complex topics explained simply with AI animation" },
  { nomor: 9, nama: "AI Lab", kategori: "tech", deskripsi: "Testing and reviewing AI tools and experiments" },
  { nomor: 10, nama: "Future Papers", kategori: "education", deskripsi: "Sci-fi concepts explained through real science" },
  { nomor: 11, nama: "Fireside Tales", kategori: "entertainment", deskripsi: "Cozy storytelling with AI-generated visuals" },
  { nomor: 12, nama: "The Big Picture", kategori: "education", deskripsi: "Big ideas visualized with AI animation" },
  { nomor: 13, nama: "Milestone", kategori: "education", deskripsi: "Key moments in human achievement" },
  { nomor: 14, nama: "Mega Digest", kategori: "news", deskripsi: "Weekly digest of the biggest stories" },
  { nomor: 15, nama: "Mind Chatter", kategori: "lifestyle", deskripsi: "Psychology and mindset insights" },
  { nomor: 16, nama: "The AI Age", kategori: "tech", deskripsi: "Living and working in the AI era" },
  { nomor: 17, nama: "Bright Ideas", kategori: "education", deskripsi: "Inventions and innovations that changed the world" },
  { nomor: 18, nama: "Wealthy Mind", kategori: "finance", deskripsi: "Financial literacy and wealth building" },
  { nomor: 19, nama: "Quick Mode", kategori: "entertainment", deskripsi: "Quick facts and trivia with AI visuals" },
  { nomor: 20, nama: "Space Signals", kategori: "science", deskripsi: "Space exploration and cosmic discoveries" },
  { nomor: 21, nama: "Casually Explained", kategori: "education", deskripsi: "Casual deep-dives into interesting topics" },
  { nomor: 22, nama: "Real Uncovered", kategori: "entertainment", deskripsi: "True stories and mysteries revealed" },
  { nomor: 23, nama: "Biographics Hub", kategori: "education", deskripsi: "Biographies of influential people" },
  { nomor: 24, nama: "AI Fusion", kategori: "tech", deskripsi: "Where AI meets creativity and art" },
  { nomor: 25, nama: "Networthy Guide", kategori: "finance", deskripsi: "Internet business and digital entrepreneurship" },
  { nomor: 26, nama: "Curiosipath", kategori: "education", deskripsi: "Curious facts and wonder-inducing content" },
  { nomor: 27, nama: "Numbers Behind", kategori: "education", deskripsi: "The stories behind the numbers and statistics" },
  { nomor: 28, nama: "Project Path", kategori: "education", deskripsi: "Step-by-step project guides and tutorials" },
  { nomor: 29, nama: "Pixel Frame", kategori: "entertainment", deskripsi: "Visual storytelling through pixel art and animation" },
  { nomor: 30, nama: "Python Lyte", kategori: "tech", deskripsi: "Python programming tutorials with AI visuals" },
  { nomor: 31, nama: "Algorithm Archive", kategori: "tech", deskripsi: "Computer science concepts made visual" },
  { nomor: 32, nama: "Assembly Tinker", kategori: "tech", deskripsi: "Hardware and electronics projects" },
  { nomor: 33, nama: "Tinker Toolbox", kategori: "education", deskripsi: "DIY and maker projects with AI visuals" },
  { nomor: 34, nama: "Con Fusion", kategori: "education", deskripsi: "Science concepts simplified and visualized" },
  { nomor: 35, nama: "Yannic Kitch", kategori: "tech", deskripsi: "AI research paper breakdowns" },
  { nomor: 36, nama: "Dave E", kategori: "tech", deskripsi: "Tech reviews and gadget analysis" },
  { nomor: 37, nama: "Science Hub", kategori: "science", deskripsi: "Scientific discoveries and breakthroughs" },
  { nomor: 38, nama: "Count Quest", kategori: "education", deskripsi: "Math and numbers made interesting" },
  { nomor: 39, nama: "Quantum Decode", kategori: "science", deskripsi: "Quantum physics made understandable" },
  { nomor: 40, nama: "Infinite Energy", kategori: "science", deskripsi: "Energy, physics, and the future of power" },
  { nomor: 41, nama: "Techno Venture", kategori: "tech", deskripsi: "Tech startups and entrepreneurship" },
  { nomor: 42, nama: "Robo Sys Studio", kategori: "tech", deskripsi: "Robotics and automation explained" },
  { nomor: 43, nama: "The Bruteon", kategori: "education", deskripsi: "Strength training and fitness education" },
  { nomor: 44, nama: "Tech Explain", kategori: "tech", deskripsi: "Technology concepts explained clearly" },
  { nomor: 45, nama: "Level Techs", kategori: "tech", deskripsi: "Tech skills and career development" },
  { nomor: 46, nama: "Hardcore Gen Tech", kategori: "tech", deskripsi: "Deep technical content for developers" },
  { nomor: 47, nama: "Epic Hard", kategori: "entertainment", deskripsi: "Epic stories and dramatic narratives" },
  { nomor: 48, nama: "Arvin Ash", kategori: "science", deskripsi: "Physics and science education" },
  { nomor: 49, nama: "Smarter Every AI", kategori: "education", deskripsi: "Learning something new every day with AI" },
  { nomor: 50, nama: "Stay Curious", kategori: "education", deskripsi: "Curiosity-driven content and discoveries" },
];

// === Prompt Modifiers (Camera, Lighting, Composition, dll) ===
const PENGUBAH_PROMPT = [
  // Camera & Movement (11)
  { kategori: "camera_movement", perintah: "/filmlook", deskripsi: "movie still quality" },
  { kategori: "camera_movement", perintah: "/skyview", deskripsi: "scale from above" },
  { kategori: "camera_movement", perintah: "/tightframe", deskripsi: "intense detail" },
  { kategori: "camera_movement", perintah: "/vastview", deskripsi: "dramatic scale" },
  { kategori: "camera_movement", perintah: "/circleshot", deskripsi: "hero reveal" },
  { kategori: "camera_movement", perintah: "/pushin", deskripsi: "builds tension" },
  { kategori: "camera_movement", perintah: "/pullback", deskripsi: "reveals the scene" },
  { kategori: "camera_movement", perintah: "/followshot", deskripsi: "follow movement" },
  { kategori: "camera_movement", perintah: "/timestretch", deskripsi: "cinematic slow motion" },
  { kategori: "camera_movement", perintah: "/fastforward", deskripsi: "shows time passing" },
  { kategori: "camera_movement", perintah: "/hypershot", deskripsi: "fast travel feeling" },
  // Camera Angles (11)
  { kategori: "camera_angle", perintah: "/groulevel", deskripsi: "makes subjects powerful" },
  { kategori: "camera_angle", perintah: "/birdseye", deskripsi: "shows isolation" },
  { kategori: "camera_angle", perintah: "/straightdown", deskripsi: "clean top-down view" },
  { kategori: "camera_angle", perintah: "/firstperson", deskripsi: "puts viewer inside" },
  { kategori: "camera_angle", perintah: "/secondview", deskripsi: "conversation framing" },
  { kategori: "camera_angle", perintah: "/openingshot", deskripsi: "sets the scene" },
  { kategori: "camera_angle", perintah: "/focuswarp", deskripsi: "moves attention" },
  { kategori: "camera_angle", perintah: "/handheld", deskripsi: "natural camera shake" },
  { kategori: "camera_angle", perintah: "/glidecam", deskripsi: "smooth movement" },
  { kategori: "camera_angle", perintah: "/liftup", deskripsi: "reveals a larger world" },
  { kategori: "camera_angle", perintah: "/settleddown", deskripsi: "creates intimacy" },
  // Motion & Action (11)
  { kategori: "motion_action", perintah: "/sprintmode", deskripsi: "high energy action" },
  { kategori: "motion_action", perintah: "/strollmode", deskripsi: "natural movement" },
  { kategori: "motion_action", perintah: "/spinreveal", deskripsi: "360 product reveal" },
  { kategori: "motion_action", perintah: "/unveil", deskripsi: "dramatic reveal" },
  { kategori: "motion_action", perintah: "/firstlook", deskripsi: "strong entrance" },
  { kategori: "motion_action", perintah: "/lastlook", deskripsi: "emotional exit" },
  { kategori: "motion_action", perintah: "/timestop", deskripsi: "freeze the peak moment" },
  { kategori: "motion_action", perintah: "/speedshift", deskripsi: "fast to slow motion" },
  { kategori: "motion_action", perintah: "/matrixtime", deskripsi: "bullet time effect" },
  { kategori: "motion_action", perintah: "/weightless", deskripsi: "dreamlike movement" },
  { kategori: "motion_action", perintah: "/dropshot", deskripsi: "urgent falling action" },
  // Cinematic Lighting (11)
  { kategori: "lighting", perintah: "/sunsetglow", deskripsi: "warm golden hour" },
  { kategori: "lighting", perintah: "/duskhour", deskripsi: "cool twilight mood" },
  { kategori: "lighting", perintah: "/neonpulse", deskripsi: "vibrant neon lighting" },
  { kategori: "lighting", perintah: "/darkmood", deskripsi: "dramatic low key light" },
  { kategori: "lighting", perintah: "/softbox", deskripsi: "soft studio lighting" },
  { kategori: "lighting", perintah: "/edgelight", deskripsi: "glowing edge light" },
  { kategori: "lighting", perintah: "/shadowform", deskripsi: "powerful silhouette" },
  { kategori: "lighting", perintah: "/spotbeam", deskripsi: "focused light" },
  { kategori: "lighting", perintah: "/lightrays", deskripsi: "atmospheric light rays" },
  { kategori: "lighting", perintah: "/glowbehind", deskripsi: "dreamy backlight" },
  { kategori: "lighting", perintah: "/nightcity", deskripsi: "cinematic night scene" },
  // Composition & Framing (11)
  { kategori: "composition", perintah: "/fullscene", deskripsi: "show the full context" },
  { kategori: "composition", perintah: "/closecrop", deskripsi: "focus on the subject" },
  { kategori: "composition", perintah: "/leanspace", deskripsi: "minimal composition" },
  { kategori: "composition", perintah: "/guidelines", deskripsi: "directs attention" },
  { kategori: "composition", perintah: "/thirdgrid", deskripsi: "balanced framing" },
  { kategori: "composition", perintah: "/mirrormatch", deskripsi: "symmetrical composition" },
  { kategori: "composition", perintah: "/frontlayer", deskripsi: "adds depth" },
  { kategori: "composition", perintah: "/innerframe", deskripsi: "frames the subject" },
  { kategori: "composition", perintah: "/slantline", deskripsi: "adds movement" },
  { kategori: "composition", perintah: "/midpoint", deskripsi: "bold center framing" },
  { kategori: "composition", perintah: "/emptyyroom", deskripsi: "quiet visual impact" },
  // Camera Effects (11)
  { kategori: "camera_effect", perintah: "/speedblur", deskripsi: "shows speed" },
  { kategori: "camera_effect", perintah: "/burstzoom", deskripsi: "dramatic zoom effect" },
  { kategori: "camera_effect", perintah: "/softdots", deskripsi: "dreamy bokeh" },
  { kategori: "camera_effect", perintah: "/sunflare", deskripsi: "cinematic lens flare" },
  { kategori: "camera_effect", perintah: "/edgefade", deskripsi: "darkens the edges" },
  { kategori: "camera_effect", perintah: "/duotone", deskripsi: "split tone grade" },
  { kategori: "camera_effect", perintah: "/grayscale", deskripsi: "dramatic monochrome" },
  { kategori: "camera_effect", perintah: "/spinblur", deskripsi: "dynamic radial blur" },
  { kategori: "camera_effect", perintah: "/rainbowsplit", deskripsi: "prism light effect" },
  { kategori: "camera_effect", perintah: "/digitalglitch", deskripsi: "digital distortion" },
  { kategori: "camera_effect", perintah: "/oldfilm", deskripsi: "vintage film feeling" },
  // Focus, Color & Portrait (11)
  { kategori: "focus_color", perintah: "/extremeclose", deskripsi: "reveals hidden texture" },
  { kategori: "focus_color", perintah: "/blurback", deskripsi: "shallow depth of field" },
  { kategori: "focus_color", perintah: "/allclear", deskripsi: "keeps the scene sharp" },
  { kategori: "focus_color", perintah: "/isolatefocus", deskripsi: "isolates the subject" },
  { kategori: "focus_color", perintah: "/gazepoint", deskripsi: "focuses the eyes" },
  { kategori: "focus_color", perintah: "/coresharp", deskripsi: "sharp center focus" },
  { kategori: "focus_color", perintah: "/darkedge", deskripsi: "tunnel effect" },
  { kategori: "focus_color", perintah: "/layerstack", deskripsi: "multiple focus points" },
  { kategori: "focus_color", perintah: "/dropdetail", deskripsi: "focuses tiny details" },
  { kategori: "focus_color", perintah: "/precisefocus", deskripsi: "controlled focus" },
  { kategori: "focus_color", perintah: "/lightshapes", deskripsi: "custom bokeh shapes" },
  // Color Grading (16)
  { kategori: "color_grading", perintah: "/amberlook", deskripsi: "warm nostalgic mood" },
  { kategori: "color_grading", perintah: "/icylook", deskripsi: "clean calm visuals" },
  { kategori: "color_grading", perintah: "/highcontrast", deskripsi: "bold striking visuals" },
  { kategori: "color_grading", perintah: "/brightbalance", deskripsi: "clear professional exposure" },
  { kategori: "color_grading", perintah: "/colorpop", deskripsi: "makes colors feel alive" },
  { kategori: "color_grading", perintah: "/mutetone", deskripsi: "quiet artistic look" },
  { kategori: "color_grading", perintah: "/gradeflat", deskripsi: "polished movie look" },
  { kategori: "color_grading", perintah: "/colorteal", deskripsi: "blockbuster color style" },
  { kategori: "color_grading", perintah: "/boldcolor", deskripsi: "grabs attention" },
  { kategori: "color_grading", perintah: "/purebw", deskripsi: "timeless elegant finish" },
  { kategori: "color_grading", perintah: "/neonwash", deskripsi: "bold futuristic style" },
  // Portrait & Subject (11)
  { kategori: "portrait", perintah: "/heroportrait", deskripsi: "powerful profile image" },
  { kategori: "portrait", perintah: "/glowskin", deskripsi: "flattering natural light" },
  { kategori: "portrait", perintah: "/haloedge", deskripsi: "separates the subject" },
  { kategori: "portrait", perintah: "/softbackdrop", deskripsi: "removes distractions" },
  { kategori: "portrait", perintah: "/crispsubject", deskripsi: "realistic portrait clarity" },
  { kategori: "portrait", perintah: "/singletone", deskripsi: "timeless mood" },
  { kategori: "portrait", perintah: "/darkframe", deskripsi: "mysterious elegant look" },
  { kategori: "portrait", perintah: "/brightframe", deskripsi: "clean commercial style" },
  { kategori: "portrait", perintah: "/macroeyes", deskripsi: "intense focal point" },
  { kategori: "portrait", perintah: "/headtoe", deskripsi: "shows the whole subject" },
  { kategori: "portrait", perintah: "/posed", deskripsi: "feels real, not staged" },
];

async function main() {
  console.log("📚 Seeding pustaka referensi...");

  // Seed GayaVideo
  for (const g of GAYA_VIDEO) {
    await db.gayaVideo.upsert({
      where: { nomor: g.nomor },
      update: g,
      create: g,
    });
  }
  console.log(`  ✅ ${GAYA_VIDEO.length} gaya video`);

  // Seed FormulaPrompt
  for (const f of FORMULA_PROMPT) {
    await db.formulaPrompt.upsert({
      where: { nomor: f.nomor },
      update: f,
      create: f,
    });
  }
  console.log(`  ✅ ${FORMULA_PROMPT.length} formula prompt`);

  // Seed IdeChannelFaceless
  for (const i of IDE_CHANNEL) {
    await db.ideChannelFaceless.upsert({
      where: { nomor: i.nomor },
      update: i,
      create: i,
    });
  }
  console.log(`  ✅ ${IDE_CHANNEL.length} ide channel faceless`);

  // Seed PengubahPrompt
  let hitung = 0;
  for (const p of PENGUBAH_PROMPT) {
    await db.pengubahPrompt.create({ data: p });
    hitung++;
  }
  console.log(`  ✅ ${hitung} pengubah prompt`);

  console.log("📚 Seeding pustaka referensi selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
