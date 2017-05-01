/**
 * Created by Administrator on 2017/5/1 0001.
 */
import actions from '../actions';
export default {
    state: {
        isSwipeOut:true,
        longChatBody:false
    },
    mutations:{
        swipeOutToggle(state){
            if(state.isSwipeOut){
                state.longChatBody = !state.longChatBody;
                setTimeout( () => {
                    state.isSwipeOut=!state.isSwipeOut;
                },100)
            }else{
                state.isSwipeOut=!state.isSwipeOut;
                setTimeout( () => {
                    state.longChatBody = !state.longChatBody;
                },100)
            }
        },
        swipeOut(state){
            if(!state.isSwipeOut){
                state.isSwipeOut=true;
                setTimeout( () => {
                    state.longChatBody = false;
                },100)
            }
        }
    },
    actions,
    getters: {

    }
}