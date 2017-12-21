<template>
    <div :class="clazz">
        <el-popover
            ref="columnspopover"
            :placement="popoverPopover"
            width="100"
            trigger="click">
            <ul>
                <li v-for="column in columns">
                    <el-checkbox
                        v-model="column.show"
                        :disabled="column.disabled">
                        {{ column.label }}
                    </el-checkbox>
                </li>
            </ul>
        </el-popover>
        <el-button size="small" v-popover:columnspopover>
            <i class="fa fa-table"></i>
            <span>配置显示列</span>
        </el-button>
    </div>
</template>

<script>
    export default {
        props: {
            columns: {
                type: Object,
                required: true
            },
            popoverPopover: {
                type: String,
                "default": 'bottom-start',
            },
            clazz: String,
        }
    }
</script>