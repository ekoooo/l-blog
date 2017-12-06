import { Message, MessageBox } from 'element-ui';

const MSG = {
    warningConfirm: (text) => {
        return MessageBox.confirm(text, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(() => {});
    },
    success: (text) => {
        Message({
            type: 'success',
            message: text
        });
    },
    error: (text) => {
        Message({
            type: 'error',
            message: text
        });
    }
};

export default MSG;
