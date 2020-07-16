[![banner](https://cdn.matteobruni.it/images/particles/banner2.png)](https://particles.matteobruni.it)

# svelte-particles

[![npm](https://img.shields.io/npm/v/svelte-particles)](https://www.npmjs.com/package/svelte-particles) [![npm downloads](https://img.shields.io/npm/dm/svelte-particles)](https://www.npmjs.com/package/svelte-particles)

Official [tsParticles](https://github.com/matteobruni/tsparticles) SvelteJS component

## Installation

```shell
npm install svelte-particles
```

or

```shell
yarn add svelte-particles
```

## Usage

```html
<script>
  import Particles from "svelte-particles";

  let particlesConfig = {
    particles: {
      color: {
        value: "#000"
      },
      links: {
        enable: true,
        color: "#000"
      },
      move: {
        enable: true
      }
    }
  };
</script>

<Particles id="tsparticles" options="{particlesConfig}" />
```

## Demos

The demo website is [here](https://particles.matteobruni.it)

<https://particles.matteobruni.it>

There's also a CodePen collection actively maintained and updated [here](https://codepen.io/collection/DPOage)

<https://codepen.io/collection/DPOage>