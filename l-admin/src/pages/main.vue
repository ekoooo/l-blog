<template>
  <main-frame>
    <router-view></router-view>
  </main-frame>
</template>

<script>
  import mainFrame from '../components/base/main-frame';

  export default {
    components: {
      mainFrame,
    }
  }
</script>
