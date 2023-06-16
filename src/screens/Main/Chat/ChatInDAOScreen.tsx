import * as React from "react";
import {StyleSheet, View, Text, FlatList, TouchableOpacity} from "react-native";
import ExpandedDAOHeader from "../../../components/ExpandedDAOHeader";
import {useRoute} from "@react-navigation/native";
import BackgroundSafeAreaView from "../../../components/BackgroundSafeAreaView";
import {useDispatch} from "react-redux";
import {DaoInfo} from "../../../declare/api/DAOApi";
import ChatLayout from "../../../components/RedPacket/ChatLayout";
import MessageInputer from "../../../components/RedPacket/MessageInputer";
import DaoApi from "../../../services/DAOApi/Dao";
import {useUrl} from "../../../utils/hook";
import {useEffect, useMemo, useRef, useState} from "react";
import {CometChat} from "@cometchat-pro/react-native-chat";
import {Color, FontSize} from "../../../GlobalStyles";
import ChatNameBox from "../../../components/RedPacket/ChatNameBox";

const ChatInDAOScreen = () => {
    const limit = 50;
    const route = useRoute();
    // @ts-ignore
    const { info } = route.params;
    const url = useUrl();
    const [daoInfo, setDaoInfo] = useState<DaoInfo>();

    const messagesRequest = useMemo(() =>
        new CometChat.MessagesRequestBuilder()
          .setGUID(info.guid).setLimit(limit).build()
    ,[])

    const [messageList, setMessageList] = useState<CometChat.BaseMessage[]>([]);

    const getDaoInfo = async () => {
        try {
            const { data } = await DaoApi.getById(url, info.daoName);
            if (data.data) {
                setDaoInfo(data.data);
            }
        } catch (e) {
            if (e instanceof Error) console.error(e.message);
        }
    }

    const getMessageInfo = async () => {
        try {
            const data: CometChat.BaseMessage[] = await messagesRequest.fetchPrevious();
            console.log(data[data.length-1],'getMessageInfo');
            await setMessageList(data.reverse());
        } catch (e) {
            if(e instanceof Error){
                console.log(e.message)
            }
        }
    }

    useEffect(()=> {
        getDaoInfo();
        getMessageInfo();
    },[]);

    useEffect(() => {
        const listenerID = 'group_message_listener';

        CometChat.addMessageListener(
          listenerID,
          new CometChat.MessageListener({
              onTextMessageReceived: (textMessage:CometChat.TextMessage) => {
                  setMessageList([textMessage,...messageList])
              },
              onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
                  setMessageList([mediaMessage,...messageList])
              },
              onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
                  setMessageList([customMessage,...messageList])
              }
          }),
        );

        return () => {
            CometChat.removeMessageListener(listenerID);
        };
    }, [messageList]);


    if(!messageList.length || !daoInfo) return <View style={styles.loadingContent}><Text style={styles.loading}>loading...</Text></View>

    return (
        <BackgroundSafeAreaView
            headerStyle={{paddingTop: 0}}
            headerComponent={ daoInfo && <ExpandedDAOHeader daoInfo={daoInfo} isShowJoined={false} isShowBtnChatToggle={false}/>}
        >
            {/*<ChatLayout />*/}
            <FlatList
              // ref={flatListRef}
              data={messageList}
              renderItem={({item})=><ChatNameBox messageInfo={item}/>}
              // @ts-ignore
              keyExtractor={(item) => item.getId()}
              inverted={true}
            />
            <MessageInputer guid={info.guid} setMessageList={setMessageList} messageList={messageList} memberCount={daoInfo?.follow_count}/>
        </BackgroundSafeAreaView>
    );
}
const styles = StyleSheet.create({
    loadingContent: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        color: Color.color1,
        fontSize: FontSize.size_xl,
        fontWeight: '600',
    },
});
export default ChatInDAOScreen