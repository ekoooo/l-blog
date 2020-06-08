<template>
  <div class="frame-box">
    <!-- 上面头部 -->
    <c-header />
    <!-- 左侧菜单栏 -->
    <c-menu />
    <!-- 右侧内容 -->
    <div class="main-frame" :class="menuClass">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import cHeader from './header';
  import cMenu from './menu';

  export default {
    computed: {
      menuClass: function() {
        return this.$store.state.openMenu ? 'open' : 'close';
      }
    },
    components: {
      cHeader,
      cMenu
    }
  }
</script>