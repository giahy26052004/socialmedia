import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, selectConversationAtom } from '../atoms/messagesAtom';
import { BsFillImageFill } from 'react-icons/bs';
import usePreviewImgs from '../hooks/usePreviewImgs';

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessagesText] = useState('');
  const selectedConversation = useRecoilValue(selectConversationAtom);
  const setConversation = useSetRecoilState(conversationAtom);
  const showtoast = useShowToast();
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImgs();
  const [isSending, setIsSending] = useState(false);
  const handleSendMessage = async e => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl
        })
      });
      const data = await res.json();
      if (data.error) showtoast('API send message', res.error, 'error');
      setMessages(message => [...message, data]);

      setConversation(preConvers => {
        const updatedConversation = preConvers.map(conversation => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
                seen: false
              }
            };
          }
          return conversation;
        });

        return updatedConversation;
      });
      setMessagesText('');
      setImgUrl('');
    } catch (error) {
      showtoast('error', error.message, 'error');
      return;
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Flex alignItems={'center'} gap={1}>
      <form onSubmit={handleSendMessage} style={{ flex: 95, marginRight: '0' }}>
        <InputGroup>
          <Input
            w={'full'}
            placeholder="Type a message"
            value={messageText}
            onChange={e => {
              setMessagesText(e.target.value);
            }}
          />
          <InputRightElement cursor={'pointer'} onClick={handleSendMessage}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={'pointer'} mr={2}>
        <Input type="file" hidden ref={imageRef} onChange={handleImageChange} />
        <BsFillImageFill
          size={20}
          onClick={() => imageRef.current.click()}
          style={{ marginLeft: '5px', cursor: 'pointer' }}
        />
      </Flex>
      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl('');
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={'full'}>
              <Image src={imgUrl} />
            </Flex>
            <Flex justifyContent={'flex-end'} my={2}>
              {!isSending ? (
                <IoSendSharp size={24} cursor={'pointer'} onClick={handleSendMessage} />
              ) : (
                <Spinner size={'md'} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
