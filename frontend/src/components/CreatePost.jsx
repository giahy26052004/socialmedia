import { AddIcon } from '@chakra-ui/icons';
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import usePreviewImgs from '../hooks/usePreviewImgs';
import { BsFillImageFill } from 'react-icons/bs';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import postsAtom from '../atoms/postsAtom';
import { useParams } from 'react-router-dom';

const MAX_CHAR = 500;
const CreatePost = () => {
  const user = useRecoilValue(userAtom);
  const showtoast = useShowToast();
  const imageRef = useRef(null);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImgs();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState('');
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();
  const handleTextChange = e => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };
  const handleCreatePost = async () => {
    setLoading(true);
    try {
      console.log(user);
      const res = await fetch('api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imgUrl
        })
      });
      const data = await res.json();
      if (data.error) {
        showtoast('error', data.error, 'error');
        return;
      }

      showtoast('Posted', 'successfully', 'success');
      if (username === user.username) setPosts([data, ...posts]);
      setImgUrl(null);
      setPostText(null);

      onClose();
    } catch (error) {
      showtoast('error Post API', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        onClick={onOpen}
        position={'fixed'}
        bottom={10}
        right={10}
        bg={useColorModeValue('gray.300', 'gray.dark')}
      >
        <AddIcon />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Post content goes here"
                value={postText}
                onChange={handleTextChange}
              />
              <Text fontSize="sm" fontWeight={'bold'} textAlign={'right'} m={1} color={'gray.800'}>
                {remainingChar}/{MAX_CHAR}
              </Text>
              <Input type="file" hidden ref={imageRef} onChange={handleImageChange} />
              <BsFillImageFill
                size={16}
                onClick={() => imageRef.current.click()}
                style={{ marginLeft: '5px', cursor: 'pointer' }}
              />
            </FormControl>
            {imgUrl && (
              <Flex mt={50} w={'full'} position={'relative'}>
                <Image src={imgUrl} alt="Selected img" />
                <CloseButton onClick={() => setImgUrl(null)} bg={'gray.800'} top={2} right={2} />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button isLoading={loading} colorScheme="blue" mr={3} onClick={handleCreatePost}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
