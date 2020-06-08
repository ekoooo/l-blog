<template>
  <div class="menu" :class="menuClass">
    <div class="toggle-btn" @click="toggleMenu">
      <i class="fa fa-bars" :class="menuClass"></i>
    </div>
    <!-- menu start -->
    <div class="menu-list">
      <el-menu
        :default-active="$route.path"
        :default-openeds="['1', '2', '3']"
        router
        class="menu-box">
        <template v-for="data in MenuConfig">
          <el-menu-item v-if="!data.item" :index="data.path">
            <el-tooltip :content="data.text" placement="right">
              <div class="tip-box"></div>
            </el-tooltip>
            <i class="fa menu-icon" :class="data.icon"></i>
            <span class="title" slot="title">{{ data.text }}</span>
          </el-menu-item>
          <el-submenu v-else :index="data.index">
            <template class="title" slot="title">
              <el-tooltip :content="data.text" placement="right">
                <div class="tip-box"></div>
              </el-tooltip>
              <i class="fa menu-icon" :class="data.icon"></i>
              <span class="title" slot="title">
                {{ data.text }}
              </span>
            </template>
            <template v-for="item in data.item">
              <el-menu-item :index="item.path">
                <el-tooltip :content="item.text" placement="right">
                  <div class="tip-box"></div>
                </el-tooltip>
                <i class="fa menu-icon" :class="item.icon"></i>
                <span class="title" slot="title">
                  {{ item.text }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
        </template>
      </el-menu>
    </div>
    <!-- menu end -->
  </div>
</template>

<script type="text/javascript">
  import MenuConfig from '../../config/menu';

  export default {
    data: function() {
      return {
        MenuConfig,
      };
    },
    methods: {
      toggleMenu: function() {
        this.$store.commit('SET_OPEN_MENU');
      },
    },
    computed: {
      menuClass: function() {
        return this.$store.state.openMenu ? 'open' : 'close';
      },
    }
  }
</script>