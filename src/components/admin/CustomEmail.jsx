import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import API from '../../BackendAPi/ApiProvider';

const CustomEmail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    imageUrl: '',
    content: '',
    senderName: 'Harmony 4 All',
    // New customizable fields
    headerLogoUrl: 'https://ci3.googleusercontent.com/meips/ADKq_NaxhjJp2OjGZTw-lyPQm7gy14IXBZ2O0eVEtL-LI5Vqo7kL0AiBKJJPIBa5F-xTr6YiiQh8cLdaIl6AJlpxbCVrg5VM7xrkrHYsiU9P5q7PzacJqdZXnhpVMhsfiHH-ED3AZtZ--viseCUB_gRDpvXnEhz_7HCmpS4lTF0UrIJsp1DB6AowI91yt1mxnvK9CEt_TlUa52pZcQ9EeztcJ3npqA6H5VYITk84WSidq7yTK3RT5Vo4shz2OWYp=s0-d-e1-ft#https://images.wixstatic.com/media/ef9da7_d98a9af11a4c48b8b4adca490896820e~mv2.png/v1/fit/h_244,q_100,w_698,al_c,lg_0/ef9da7_d98a9af11a4c48b8b4adca490896820e~mv2.png',
    joinMissionButtonText: 'Join Our Mission',
    joinMissionButtonLink: 'https://www.harmony4all.org/',
    followUsText: 'Follow Us',
    socialHandle: '@JoinHarmony4All',
    socialHandleLink: 'https://www.facebook.com/JoinHarmony4All/?_rdc=1&_rdr#',
    candidSealImageUrl: 'https://ci3.googleusercontent.com/meips/ADKq_NYGVW8BFjgAQRRnofpi33mLvQLecIYPKmlYQfC3somMxhtbpprFw7xYuKEG8-qkuKUemy3HkhNRl3NS6ViJGvVErcA8VLw7x6CFA_lJo5r6PZLiqCRE1nr_E2_SudraNhb3PjI0Jhl7878BbPuTn10te_t3EbqhmtpLOGFxSdBt0vtn_v_wtBnCC9f0yk10DjO-XYa-VfNKeJE1gg-2IDgNwqFud_vcRkqXE0fNBT8cqtUdPQcXmw=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png/v1/fit/w_108,h_2000,al_c,q_85/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png',
    footerEmail: 'media@harmony44all.org',
    footerLocation: 'New York, NY, USA',
    siteLinkText: 'Check out our site',
    siteLinkUrl: 'https://www.harmony4all.org/',
    // Social Media Links
    socialMediaLinks: {
      email: 'mailto:media@harmony44all.org',
      facebook: 'https://www.facebook.com/JoinHarmony4All/?_rdc=1&_rdr#',
      instagram: 'https://www.instagram.com/joinharmony4all/',
      linkedin: 'https://www.linkedin.com/company/joinharmony4all/?viewAsMember=true',
      youtube: 'https://www.youtube.com/watch?v=CQXnJpY_zR8&feature=youtu.be'
    },
    // Social Media Images
    socialMediaImages: {
      email: 'https://ci3.googleusercontent.com/meips/ADKq_NZbIcc6YsIB4oKhL7RwOPjlsesyjBfGMnAso4ru8879jnCS491qFjsGeP4qKTEqXUqja7O6igWKq8e_zcBS6bCDxA-cmRG_6PNSZdellpjrr2vCN8smfoLn_VXBlKZkc6TXtHFqUJaf=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_8674e07a41a640aaa92aba6408fe7ad5~mv2.png',
      facebook: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/facebook-round-svgrepo-com_vm9xen.png',
      instagram: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784571/instagram-svgrepo-com_vmf73a.png',
      linkedin: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/linkedin-round-svgrepo-com_nhwjgc.png',
      youtube: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/youtube-round-svgrepo-com_pmqfij.png'
    },
    // Funders and Sponsors Data
    fundersData: {
      bannerText: 'With Gratitude To Our Funders And Sponsors For Helping Us Keep Making Music Accessible',
      logo1: 'https://ci3.googleusercontent.com/meips/ADKq_NYU6FnI4QTxQI96oTlr3B-MP9cAXVhhNYdqITkbG_i6jCRwq9VoNZBfTyUO9HwWOc-jyge_Ervvx3SfSP92S8Yyey_BPBSeb70-p0IKB-frrIFKJBgye5bovPjSBBZUjwUCV-5oH6vdpf3p7cTxk7ujILVMNjRtGTAE42-sSEu6PT77HuqgV9C1-5TjNLstGIQNN5ZXd6KAfEyRJtJHNsE_b4D_hF-CrH0SoKmDf101grNcgDa0cA=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_105f84cdb8994fe5bbcc0782bac6da50~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/ef9da7_105f84cdb8994fe5bbcc0782bac6da50~mv2.jpg',
      logo2: 'https://ci3.googleusercontent.com/meips/ADKq_NbyPT9XcrYKoBQR8snvWC39vHRl8rO47TlG3uJ6badSmuzfxSouIClKKkHaUFEUj-4t7r4wQRz5K7jXBdrhFXjdeR3_XSbjRNuybpJTUtZUZwvOSuyst2QIy1Aa255fjixQ7KBleJpM3JU4e_w0kBtvMYxoIC615wogcgUwyeeYQGOx4LzSHJJKJwDOtVrZFhEHPjc1RhwbRlUP2sDQzgy2NNBWuFNroFT-7-yEYN0-LfgwclQoHQ=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_df9fd1d3ce314782a9bf361aa5cd1210~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/bb6757_df9fd1d3ce314782a9bf361aa5cd1210~mv2.jpg',
      logo3: 'https://ci3.googleusercontent.com/meips/ADKq_NYNbOG6IbKXWa6DbaWUnuH4G1SEcv9ye5HxK9dIc0q5Og3Rys6xMMhMRPfkPDuV6Q9MbbqMH_pF8nlBDvVL8bIGfdsxp9ZV4JDmimf-Uxaf76qMF6QHHkoWmNxWTBn6NWK2BuucVE_2vow55CvE7Mddh3QCXxdWzTO_PvQi6nmfGMGfObp45eZFoKtpQVLyVIM-dXQP69K9gz-6fAIgMUW4RN4dYVkX8TzJZfNW9kG8tKfUTKTg7Q=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_3aba7369761f4a89acb134a0f436c586~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_3aba7369761f4a89acb134a0f436c586~mv2.png',
      logo4: 'https://ci3.googleusercontent.com/meips/ADKq_NYAAOXSWlq-RO_sfuAxb-ZRdHlaOrYhmR1ZL0BO9MasqR_nJyBxnDQGfcoYqZCRbfoNmDQShQLMwhfexZRnApzHnnD30DCQFuAk77MATcQJ5GrAlURIdmoEiBynNxAiVuNzJCSSxyzTRbVtW4qnywI00gpg0Xnqim7o5Cxfn-Itsh--4c5tGO8eNcOGRQQievUdlD6CWO6cRsZZPyr5nXqupsdlCJ-UjPtkamVir0iTRmLi3WhQcQ=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_a5afa8ccac484fcd8a17b8ce34b74fe0~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/bb6757_a5afa8ccac484fcd8a17b8ce34b74fe0~mv2.jpg',
      logo5: 'https://ci3.googleusercontent.com/meips/ADKq_NZE2iDg0YVuvLgZzHQpYQ2Mmrhz52RnzoPjIdaXEKniJCHZpt4JL1rDiC81D2BvrEBZ11qMej2VrKpQ0GlrWK7xWDRzvrwhizIIhzITYpZvMj7kPX4rgQQhdyU6OEhqccsK_kaR7Jnmvuz99sr4xBB_-TknnaBW1x-8wrTqosYNTM4CY2V8uMpVH1AgPp3xKuc4Z1RQ0bZ95sT1BGtiLHcR5WqIH_j8dbTR_gg6-RL-UUD3_LlITw=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_af4f47b402d0463e88b8b053ea04609e~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_af4f47b402d0463e88b8b053ea04609e~mv2.png',
      logo6: 'https://ci3.googleusercontent.com/meips/ADKq_Nbp1AoVxqG62yYSsTr1yO498rqpZuB3_QlPoJiJUVAEJBR7Lf7zUjeLK8TwU38lYvUSIJyKF-71c5rrYMol9jwyx0tgWxpmleOzJSy8Mv_CHOaobD3-Ve73xnN6c7rKhTIKI-EhkgBOcm7NkUR_dDclY06kVSOPYLLwoqUgGkfV_D5kOz2ZkHkKejUZUcFptkZa9YWBf2EGU0TPWhicHi0XE91daYVklYF389KthT-ToHpUhJeH8w=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_64b718fb08b5495b9c94938d7a690ac0~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_64b718fb08b5495b9c94938d7a690ac0~mv2.png',
      logo7: 'https://ci3.googleusercontent.com/meips/ADKq_NZb3GbJdH8mj3l28VAf5ojrvXirDyye7YAVvVBCA57tXTbRdgebHMjsdE-feFtZs_Vy0BibZ-363pm4Y-S2v-Iwtksn_lO_caxqxBO5l5O7twgV9EVcxOIyfOYcY5gbUOiIzQ1p4dYSk_mIEdkWR6pmpMXqlk-tRbInsej5pC2aSYMQzanuxK1be7PN5Cx7MJ5JcKSaldOSqn8fitQSxGoSAbjQ1l4keuxFlgwVn5BbZwz-Ws6Xeg=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_cf9876b510634dc6a9bc17b70b931e13~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_cf9876b510634dc6a9bc17b70b931e13~mv2.png',
      logo8: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1760205286/Screenshot_from_2025-10-11_22-43-59_zekjmu.png',
      logo9: 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1759744678/Screenshot_2025-10-06_175425_ntlvzt.png',
      link1: 'https://thenewyorkinjurylawfirm.com/',
      link2: 'https://www.nysenate.gov/senators/joseph-p-addabbo-jr',
      link3: 'https://www.governor.ny.gov/',
      link4: 'https://www.nysenate.gov/issues/new-york-state-legislature',
      link5: 'https://arts.ny.gov/our-mission',
      link6: 'https://www.nyc.gov/site/dcla/index.page',
      link7: 'https://www.nyfa.org/',
      link8: 'https://www.citizensnyc.org',
      link9: 'https://www.harmony4all.org/sponsors'
    }
  });

  const [sendData, setSendData] = useState({
    senderAccountIndex: 0,
    recipientEmails: ''
  });
  
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendResults, setSendResults] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'align', 'link'
  ];

  useEffect(() => {
    fetchGmailAccounts();
  }, []);

  const fetchGmailAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await API.get('/api/admin/email/accounts');
      console.log('respone',response)
      setGmailAccounts(response.data);
    } catch (err) {
      setError('Failed to load Gmail accounts');
      console.error('Error fetching Gmail accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRecipientEmailsChange = (event) => {
    const value = event.target.value;
    setSendData(prev => ({
      ...prev,
      recipientEmails: value
    }));
  };

  const parseRecipientEmails = () => {
    if (!sendData.recipientEmails.trim()) return [];
    return sendData.recipientEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const handleSend = () => {
    if (!formData.title && !formData.subject) {
      setError('Please enter either a title or subject');
      return;
    }
    setSendDialogOpen(true);
  };

  const handleSendEmail = async () => {
    const emails = parseRecipientEmails();
    if (emails.length === 0) {
      setError('Please enter at least one recipient email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await API.post('/api/admin/email/send-custom', {
        senderAccountIndex: sendData.senderAccountIndex,
        recipientEmails: emails,
        title: formData.title,
        subject: formData.subject,
        imageUrl: formData.imageUrl,
        content: formData.content,
        senderName: formData.senderName,
        headerLogoUrl: formData.headerLogoUrl,
        joinMissionButtonText: formData.joinMissionButtonText,
        joinMissionButtonLink: formData.joinMissionButtonLink,
        followUsText: formData.followUsText,
        socialHandle: formData.socialHandle,
        socialHandleLink: formData.socialHandleLink,
        candidSealImageUrl: formData.candidSealImageUrl,
        footerEmail: formData.footerEmail,
        footerLocation: formData.footerLocation,
        siteLinkText: formData.siteLinkText,
        siteLinkUrl: formData.siteLinkUrl,
        socialMediaLinks: formData.socialMediaLinks,
        socialMediaImages: formData.socialMediaImages,
        fundersData: formData.fundersData
      });

      setSendResults(response.data.results);
      setResultsOpen(true);
      setSendDialogOpen(false);
      setSuccess(`Email sent successfully! ${response.data.results.successful} successful, ${response.data.results.failed} failed.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
      console.error('Error sending email:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHTML = () => {
    const { 
      title, 
      imageUrl, 
      content, 
      senderName,
      headerLogoUrl,
      joinMissionButtonText,
      joinMissionButtonLink,
      followUsText,
      socialHandle,
      socialHandleLink,
      candidSealImageUrl,
      footerEmail,
      footerLocation,
      siteLinkText,
      siteLinkUrl,
      socialMediaLinks,
      socialMediaImages,
      fundersData
    } = formData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Custom Email'}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
    }
    a{
      color:rgb(0, 0, 0) !important;
    }
    a:link, a:visited, a:hover, a:active {
      color:rgb(0, 0, 0) !important;
    }
    .container { 
      max-width: 800px; 
      background-color: #ffffff;
      margin: 20px auto; 
      border: 1px solid #9ba5a5;
      background: white; 
      border-radius: 8px;
      overflow: hidden; 
    }
    .header { 
      background: white; 
      padding: isMobile ? 0px : 30px; 
      text-align: center; 
      border-bottom: 1px solid #9ba5a5; 
      width: 100%;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .logo-image {
      width: 250px;
      height: 180px;
      margin: auto;
      display: block;
      object-fit: contain;
    }
    .content { 
      padding: 30px; 
      background: white; 
    }
    .blog-title { 
      color: #2d3748; 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 15px; 
      line-height: 1.3; 
    }
    .blog-author { 
      color: #666; 
      font-size: 16px; 
      text-align: right; 
      margin-bottom: 25px; 
    }
    .blog-content { 
      color: #4a5568; 
      font-size: 16px; 
      line-height: 1.8; 
      margin-bottom: 30px; 
    }
    .blog-content p { 
      margin-bottom: 15px; 
      margin-top: 0;
    }
    .blog-content p:first-child {
      margin-top: 0;
    }
    .blog-content p:last-child {
      margin-bottom: 0;
    }
    .blog-content strong { 
      font-weight: bold; 
      color: #2d3748;
    }
    .blog-content b { 
      font-weight: bold; 
      color: #2d3748;
    }
    .blog-content em { 
      font-style: italic; 
    }
    .blog-content i { 
      font-style: italic; 
    }
    .blog-content u {
      text-decoration: underline;
    }
    .blog-content a { 
      color: #2d3748 !important; 
      text-decoration: underline; 
    }
    .blog-content a:hover {
      color: #1a202c !important;
    }
    .blog-content ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .blog-content ol {
      margin: 15px 0;
      padding-left: 20px;
    }
    .blog-content li {
      margin-bottom: 8px;
    }
    .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
      color: #2d3748;
      margin: 20px 0 10px 0;
      font-weight: bold;
    }
    .blog-content h1 { font-size: 24px; }
    .blog-content h2 { font-size: 22px; }
    .blog-content h3 { font-size: 20px; }
    .blog-content h4 { font-size: 18px; }
    .blog-content h5 { font-size: 16px; }
    .blog-content h6 { font-size: 14px; }
    .blog-content blockquote {
      border-left: 4px solid #9ba5a5;
      padding-left: 15px;
      margin: 15px 0;
      font-style: italic;
      color: #666;
    }
    .blog-content hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    .footer { 
      background: #ffffff; 
      padding: 30px; 
      text-align: center; 
    }
    .join-mission-btn { 
      display: inline-block; 
      background: #000; 
      color: #fff !important; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 25px; 
      font-weight: bold; 
      margin-bottom: 25px; 
      font-size: 14px;
      font-family: Arial, sans-serif;
    }
    .join-mission-btn:hover {
      color: #fff !important;
    }
    .join-mission-btn:visited {
      color: #fff !important;
    }
    .join-mission-btn:link {
      color: #fff !important;
    }
    .follow-us { 
      margin-bottom: 20px; 
    }
    .follow-us-text { 
      font-size: 16px; 
      color: #000; 
      margin-bottom: 8px; 
      font-weight: bold;
      font-family: Arial, sans-serif;
    }
    .social-handle {
      font-size: 16px;
      color:rgb(0, 0, 0);
      margin-bottom: 15px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }
    .social-icons-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      margin-bottom: 25px;
      width: 100%;
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      flex-wrap: nowrap;
      max-width: 270px;
    }
    .social-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      margin-right: 10px;
      background:rgb(255, 255, 255);
      align-items: center;
      justify-content: center;
    }
    .social-icon img {
      width: 40px;
      height: 40px;
      object-fit: cover;
    }
    .candid-seal {
      margin-bottom: 25px;
    }
    .candid-image {
      width: 140px;
      height: auto;
      border: 2px solid #b8d4da;
      border-radius: 5px;
    }
    .contact-section { 
      display: flex; 
      justify-content: start; 
      align-items: center; 
      margin-top: 25px;
      padding-top: 20px; 
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      width: 100%;
    }
    .contact-info { 
      text-align: left; 
      font-size: 14px; 
      color: #000 !important; 
      font-family: Arial, sans-serif;
    }
    .site-link { 
      text-align: right; 
      font-size: 14px; 
      color: #000 !important; 
      font-family: Arial, sans-serif;
    }
    .arrow-image {
      width: 17px;
      height: 17px;
      margin-left: 5px;
      margin-top: 10px;
    }
    .site-link-text {
      text-decoration: none;
      color: #000 !important;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }
    .vertical-line { 
      width: 1px; 
      height: 40px; 
      background: #9ba5a5; 
      margin: 0 70px;
    }
    .blog-image-box {
      width: 100%;
      height: 500px;
      margin-bottom: 20px;
    }
    .blog-image {
      width: 100%;
      height: 500px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
      display: block;
    }
    .funders-section {
      background: #ffffff;
    }
    .funders-banner {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .funders-title {
      color: #2d3748;
      font-size: 18px;
      font-weight: bold;
      margin: 0;
      line-height: 1.4;
    }
    .funders-logos {
      width: 100%;
    }
    .funders-row {
      width: 100%;
      margin-bottom: 15px;
    }
    .funders-logo {
      width: 33.33%;
      text-align: center;
      padding: 5px;
      vertical-align: middle;
    }
    .funders-logo-img {
      max-width: 100%;
      max-height: 80px;
      object-fit: contain;
      filter: grayscale(0%);
      transition: filter 0.3s ease;
    }
    .funders-logo-img:hover {
      filter: grayscale(0%);
    }
    .funders-logo-link {
      display: block;
      text-decoration: none;
      color: inherit;
    }
    .funders-logo-link:hover {
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <img src="${headerLogoUrl || '/logo.png'}" alt="Harmony 4 All Logo" class="logo-image" onerror="this.src='/logo.png'">            
      </div>
    </div>
    
    <div class="content">
      <h1 class="blog-title">${title || 'Harmony 4 All'}</h1>
      <div class="blog-author">By: ${senderName}</div>
      
      ${imageUrl ? `
        <div class="blog-image-box">
          <img src="${imageUrl}" alt="${title || 'Email Image'}" class="blog-image">
        </div>
      ` : ''}

      <div class="blog-content">
        ${content || '<p>Thank you for your continued support of Harmony 4 All!</p>'}
      </div>
      
    </div>
    
    <!-- Funders and Sponsors Section -->
    <div class="funders-section">
      <div class="funders-banner">
        <h3 class="funders-title">${fundersData.bannerText || 'With Gratitude To Our Funders And Sponsors For Helping Us Keep Making Music Accessible'}</h3>
      </div>
      <table class="funders-logos" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- First Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link1 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo1 || 'https://ci3.googleusercontent.com/meips/ADKq_NYU6FnI4QTxQI96oTlr3B-MP9cAXVhhNYdqITkbG_i6jCRwq9VoNZBfTyUO9HwWOc-jyge_Ervvx3SfSP92S8Yyey_BPBSeb70-p0IKB-frrIFKJBgye5bovPjSBBZUjwUCV-5oH6vdpf3p7cTxk7ujILVMNjRtGTAE42-sSEu6PT77HuqgV9C1-5TjNLstGIQNN5ZXd6KAfEyRJtJHNsE_b4D_hF-CrH0SoKmDf101grNcgDa0cA=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_105f84cdb8994fe5bbcc0782bac6da50~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/ef9da7_105f84cdb8994fe5bbcc0782bac6da50~mv2.jpg'}" alt="Sponsor 1" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link2 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo2 || 'https://ci3.googleusercontent.com/meips/ADKq_NbyPT9XcrYKoBQR8snvWC39vHRl8rO47TlG3uJ6badSmuzfxSouIClKKkHaUFEUj-4t7r4wQRz5K7jXBdrhFXjdeR3_XSbjRNuybpJTUtZUZwvOSuyst2QIy1Aa255fjixQ7KBleJpM3JU4e_w0kBtvMYxoIC615wogcgUwyeeYQGOx4LzSHJJKJwDOtVrZFhEHPjc1RhwbRlUP2sDQzgy2NNBWuFNroFT-7-yEYN0-LfgwclQoHQ=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_df9fd1d3ce314782a9bf361aa5cd1210~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/bb6757_df9fd1d3ce314782a9bf361aa5cd1210~mv2.jpg'}" alt="Sponsor 2" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link3 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo3 || 'https://ci3.googleusercontent.com/meips/ADKq_NYNbOG6IbKXWa6DbaWUnuH4G1SEcv9ye5HxK9dIc0q5Og3Rys6xMMhMRPfkPDuV6Q9MbbqMH_pF8nlBDvVL8bIGfdsxp9ZV4JDmimf-Uxaf76qMF6QHHkoWmNxWTBn6NWK2BuucVE_2vow55CvE7Mddh3QCXxdWzTO_PvQi6nmfGMGfObp45eZFoKtpQVLyVIM-dXQP69K9gz-6fAIgMUW4RN4dYVkX8TzJZfNW9kG8tKfUTKTg7Q=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_3aba7369761f4a89acb134a0f436c586~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_3aba7369761f4a89acb134a0f436c586~mv2.png'}" alt="Sponsor 3" class="funders-logo-img">
            </a>
          </td>
        </tr>
        <!-- Second Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link4 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo4 || 'https://ci3.googleusercontent.com/meips/ADKq_NYAAOXSWlq-RO_sfuAxb-ZRdHlaOrYhmR1ZL0BO9MasqR_nJyBxnDQGfcoYqZCRbfoNmDQShQLMwhfexZRnApzHnnD30DCQFuAk77MATcQJ5GrAlURIdmoEiBynNxAiVuNzJCSSxyzTRbVtW4qnywI00gpg0Xnqim7o5Cxfn-Itsh--4c5tGO8eNcOGRQQievUdlD6CWO6cRsZZPyr5nXqupsdlCJ-UjPtkamVir0iTRmLi3WhQcQ=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_a5afa8ccac484fcd8a17b8ce34b74fe0~mv2.jpg/v1/fit/w_700,h_2000,al_c,q_85/bb6757_a5afa8ccac484fcd8a17b8ce34b74fe0~mv2.jpg'}" alt="Sponsor 4" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link5 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo5 || 'https://ci3.googleusercontent.com/meips/ADKq_NZE2iDg0YVuvLgZzHQpYQ2Mmrhz52RnzoPjIdaXEKniJCHZpt4JL1rDiC81D2BvrEBZ11qMej2VrKpQ0GlrWK7xWDRzvrwhizIIhzITYpZvMj7kPX4rgQQhdyU6OEhqccsK_kaR7Jnmvuz99sr4xBB_-TknnaBW1x-8wrTqosYNTM4CY2V8uMpVH1AgPp3xKuc4Z1RQ0bZ95sT1BGtiLHcR5WqIH_j8dbTR_gg6-RL-UUD3_LlITw=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_af4f47b402d0463e88b8b053ea04609e~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_af4f47b402d0463e88b8b053ea04609e~mv2.png'}" alt="Sponsor 5" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link6 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo6 || 'https://ci3.googleusercontent.com/meips/ADKq_Nbp1AoVxqG62yYSsTr1yO498rqpZuB3_QlPoJiJUVAEJBR7Lf7zUjeLK8TwU38lYvUSIJyKF-71c5rrYMol9jwyx0tgWxpmleOzJSy8Mv_CHOaobD3-Ve73xnN6c7rKhTIKI-EhkgBOcm7NkUR_dDclY06kVSOPYLLwoqUgGkfV_D5kOz2ZkHkKejUZUcFptkZa9YWBf2EGU0TPWhicHi0XE91daYVklYF389KthT-ToHpUhJeH8w=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_64b718fb08b5495b9c94938d7a690ac0~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_64b718fb08b5495b9c94938d7a690ac0~mv2.png'}" alt="Sponsor 6" class="funders-logo-img">
            </a>
          </td>
        </tr>
        <!-- Third Row: 3 logos -->
        <tr class="funders-row">
          <td class="funders-logo">
            <a href="${fundersData.link7 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo7 || 'https://ci3.googleusercontent.com/meips/ADKq_NZb3GbJdH8mj3l28VAf5ojrvXirDyye7YAVvVBCA57tXTbRdgebHMjsdE-feFtZs_Vy0BibZ-363pm4Y-S2v-Iwtksn_lO_caxqxBO5l5O7twgV9EVcxOIyfOYcY5gbUOiIzQ1p4dYSk_mIEdkWR6pmpMXqlk-tRbInsej5pC2aSYMQzanuxK1be7PN5Cx7MJ5JcKSaldOSqn8fitQSxGoSAbjQ1l4keuxFlgwVn5BbZwz-Ws6Xeg=s0-d-e1-ft#https://static.wixstatic.com/media/bb6757_cf9876b510634dc6a9bc17b70b931e13~mv2.png/v1/fit/w_700,h_2000,al_c,q_85/bb6757_cf9876b510634dc6a9bc17b70b931e13~mv2.png'}" alt="Sponsor 7" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link8 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo8 || 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1760118756/koll2ak5y9cmgl5628i_lcudcj.png'}" alt="Sponsor 8" class="funders-logo-img">
            </a>
          </td>
          <td class="funders-logo">
            <a href="${fundersData.link9 || '#'}" target="_blank" class="funders-logo-link">
              <img src="${fundersData.logo9 || 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1759744678/Screenshot_2025-10-06_175425_ntlvzt.png'}" alt="Sponsor 9" class="funders-logo-img">
            </a>
          </td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <a href="${joinMissionButtonLink}" class="join-mission-btn">${joinMissionButtonText}</a>
      
      <div class="follow-us">
        <div class="follow-us-text">${followUsText}</div>
        <div class="social-handle">
          <a href="${socialHandleLink}" style="color: rgb(0, 0, 0); text-decoration: none;">${socialHandle}</a>
        </div>
      </div>
      
      <div class="social-icons-container">
        <a href="${socialMediaLinks.email || 'mailto:media@harmony44all.org'}" class="social-icon">
          <img src="${socialMediaImages.email || 'https://ci3.googleusercontent.com/meips/ADKq_NZbIcc6YsIB4oKhL7RwOPjlsesyjBfGMnAso4ru8879jnCS491qFjsGeP4qKTEqXUqja7O6igWKq8e_zcBS6bCDxA-cmRG_6PNSZdellpjrr2vCN8smfoLn_VXBlKZkc6TXtHFqUJaf=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_8674e07a41a640aaa92aba6408fe7ad5~mv2.png'}" alt="Email">
        </a>
        <a href="${socialMediaLinks.facebook || '#'}" class="social-icon">
          <img src="${socialMediaImages.facebook || 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/facebook-round-svgrepo-com_vm9xen.png'}" alt="Facebook">
        </a>
        <a href="${socialMediaLinks.instagram || '#'}" class="social-icon">
          <img src="${socialMediaImages.instagram || 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784571/instagram-svgrepo-com_vmf73a.png'}" alt="Instagram">
        </a>
        <a href="${socialMediaLinks.linkedin || '#'}" class="social-icon">
          <img src="${socialMediaImages.linkedin || 'https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/linkedin-round-svgrepo-com_nhwjgc.png'}" alt="LinkedIn">
        </a>
        <a href="${socialMediaLinks.youtube || '#'}" class="social-icon">
          <img src="${socialMediaImages.youtube || '/https://res.cloudinary.com/dcvqytwuq/image/upload/v1758784174/youtube-round-svgrepo-com_pmqfij.png'}" alt="YouTube">
        </a>
      </div>
      
      <div class="candid-seal">
        <img src="${candidSealImageUrl || 'https://ci3.googleusercontent.com/meips/ADKq_NYGVW8BFjgAQRRnofpi33mLvQLecIYPKmlYQfC3somMxhtbpprFw7xYuKEG8-qkuKUemy3HkhNRl3NS6ViJGvVErcA8VLw7x6CFA_lJo5r6PZLiqCRE1nr_E2_SudraNhb3PjI0Jhl7878BbPuTn10te_t3EbqhmtpLOGFxSdBt0vtn_v_wtBnCC9f0yk10DjO-XYa-VfNKeJE1gg-2IDgNwqFud_vcRkqXE0fNBT8cqtUdPQcXmw=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png/v1/fit/w_108,h_2000,al_c,q_85/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png'}" alt="Platinum Transparency 2025 Candid" class="candid-image" onerror="this.src='https://ci3.googleusercontent.com/meips/ADKq_NYGVW8BFjgAQRRnofpi33mLvQLecIYPKmlYQfC3somMxhtbpprFw7xYuKEG8-qkuKUemy3HkhNRl3NS6ViJGvVErcA8VLw7x6CFA_lJo5r6PZLiqCRE1nr_E2_SudraNhb3PjI0Jhl7878BbPuTn10te_t3EbqhmtpLOGFxSdBt0vtn_v_wtBnCC9f0yk10DjO-XYa-VfNKeJE1gg-2IDgNwqFud_vcRkqXE0fNBT8cqtUdPQcXmw=s0-d-e1-ft#https://static.wixstatic.com/media/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png/v1/fit/w_108,h_2000,al_c,q_85/ef9da7_441d25464f0d457fa3e7dec5ab394004~mv2.png'">
      </div>
      
    </div>
  </div>
</body>
</html>`;
  };

  if (loadingAccounts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ inHeight: '100vh'}}>
      <Box display={`${isMobile && showMobilePreview ? 'none' : 'flex'}`} alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d3748' }}>
        </Typography>
        <Box display="flex" gap={2}>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={showMobilePreview ? <EditIcon /> : <PreviewIcon />}
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              sx={{ 
                borderColor: '#000', 
                color: '#000',
                borderRadius: '25px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {showMobilePreview ? 'Close Preview' : 'Preview'}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSend}
            disabled={loading}
            sx={{ 
              backgroundColor: '#000', 
              color: '#fff',
              borderRadius: '25px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333'
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

       <Grid container spacing={3} sx={{ minHeight: '100vh' }}>
        {/* Left Panel - Form Inputs */}
        <Grid item xs={12} md={6} sx={{ display: isMobile && showMobilePreview ? 'none' : 'block' }}>
          <Paper sx={{ 
            height: 'fit-content',
            borderRadius: '8px',
            boxShadow: 'none',
            border: '1px solid #9ba5a5',
            p:  isMobile ? 0 : 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 'bold' }}>
              Email Configuration
            </Typography>
            
             <Grid container spacing={2}>
               {/* Header Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Header
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Header Logo URL"
                   value={formData.headerLogoUrl}
                   onChange={handleInputChange('headerLogoUrl')}
                   placeholder="https://example.com/logo.png"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Title"
                   value={formData.title}
                   onChange={handleInputChange('title')}
                   placeholder="Email title (appears in header)"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Subject"
                   value={formData.subject}
                   onChange={handleInputChange('subject')}
                   placeholder="Email subject line"
                 />
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Sender Name"
                   value={formData.senderName}
                   onChange={handleInputChange('senderName')}
                   placeholder="Harmony 4 All"
                 />
               </Grid>

               {/* Main Content Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Main Content
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Image URL"
                   value={formData.imageUrl}
                   onChange={handleInputChange('imageUrl')}
                   placeholder="https://example.com/image.jpg"
                 />
               </Grid>

               <Grid item xs={12}>
                 <Typography variant="subtitle2" gutterBottom sx={{ color: '#2d3748', fontWeight: 'bold' }}>
                   Content
                 </Typography>
                 <Box sx={{ 
                   border: '1px solid #9ba5a5', 
                   borderRadius: '4px',
                   '& .ql-editor': {
                     minHeight: '200px',
                     fontSize: '16px',
                     fontFamily: 'Arial, sans-serif'
                   },
                   '& .ql-toolbar': {
                     borderTop: 'none',
                     borderLeft: 'none',
                     borderRight: 'none',
                     borderBottom: '1px solid #9ba5a5'
                   }
                 }}>
                   <ReactQuill
                     theme="snow"
                     value={formData.content}
                     onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                     modules={quillModules}
                     formats={quillFormats}
                     placeholder="Enter your email content here..."
                   />
                 </Box>
               </Grid>

               {/* Join Mission Button Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Join Mission Button
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Button Text"
                   value={formData.joinMissionButtonText}
                   onChange={handleInputChange('joinMissionButtonText')}
                   placeholder="Join Our Mission"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Button Link"
                   value={formData.joinMissionButtonLink}
                   onChange={handleInputChange('joinMissionButtonLink')}
                   placeholder="https://example.com/join"
                 />
               </Grid>

               {/* Funders and Sponsors Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Funders and Sponsors
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Funders Banner Text"
                   value={formData.fundersData.bannerText}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, bannerText: e.target.value }
                   }))}
                   placeholder="With Gratitude To Our Funders And Sponsors For Helping Us Keep Making Music Accessible"
                   multiline
                   rows={2}
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 1"
                   value={formData.fundersData.logo1}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo1: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 2"
                   value={formData.fundersData.logo2}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo2: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 3"
                   value={formData.fundersData.logo3}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo3: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 4"
                   value={formData.fundersData.logo4}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo4: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 5"
                   value={formData.fundersData.logo5}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo5: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 6"
                   value={formData.fundersData.logo6}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo6: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 7"
                   value={formData.fundersData.logo7}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo7: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               <Grid item xs={12} sm={4}>
                 <TextField
                   fullWidth
                   label="Sponsor Logo 8"
                   value={formData.fundersData.logo8}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, logo8: e.target.value }
                   }))}
                   placeholder="/placeholder-logo.png"
                 />
               </Grid>

               {/* Funders Links Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Funders Links
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 1"
                   value={formData.fundersData.link1}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link1: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 2"
                   value={formData.fundersData.link2}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link2: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 3"
                   value={formData.fundersData.link3}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link3: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 4"
                   value={formData.fundersData.link4}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link4: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 5"
                   value={formData.fundersData.link5}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link5: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 6"
                   value={formData.fundersData.link6}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link6: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 7"
                   value={formData.fundersData.link7}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link7: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Funder Link 8"
                   value={formData.fundersData.link8}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     fundersData: { ...prev.fundersData, link8: e.target.value }
                   }))}
                   placeholder="https://example.com"
                 />
               </Grid>

               {/* Footer & Contact Section */}
               <Grid item xs={12}>
                 <Divider sx={{ my: 2 }}>
                   <Typography variant="subtitle2" color="text.secondary">
                     Footer & Contact
                   </Typography>
                 </Divider>
               </Grid>

               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Candid Seal Image URL"
                   value={formData.candidSealImageUrl}
                   onChange={handleInputChange('candidSealImageUrl')}
                   placeholder="https://example.com/candid.png"
                 />
               </Grid>
             </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} md={6} sx={{ 
          width: isMobile ? '100%' : '40%',
          alignSelf: 'flex-start',
          height: isMobile ? '100vh' : '300vh',
          display: isMobile && !showMobilePreview ? 'none' : 'block'
        }}>
          <Paper sx={{ 
            height: '100%',
            boxShadow: 'none',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {isMobile && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#fff', 
                borderBottom: '1px solid #9ba5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" sx={{ color: '#2d3748', fontWeight: 'bold' }}>
                  Email Preview
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowMobilePreview(false)}
                  size="small"
                  sx={{ 
                    borderColor: '#000', 
                    color: '#000',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: '#333',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Close Preview
                </Button>
              </Box>
            )}
            <Box
              sx={{
                flex: 1,
                overflow: 'hidden',
                '& iframe': {
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }
              }}
            >
              <iframe
                srcDoc={generatePreviewHTML()}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

       {/* Send Dialog */}
       <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Send Email</DialogTitle>
         <DialogContent>
           <Grid container spacing={2} sx={{ mt: 1 }}>
             <Grid item xs={12}>
               <FormControl fullWidth>
                 <InputLabel>Sender Account</InputLabel>
                 <Select
                   value={sendData.senderAccountIndex}
                   label="Sender Account"
                   onChange={(e) => setSendData(prev => ({ ...prev, senderAccountIndex: e.target.value }))}
                 >
                   {gmailAccounts.map((account, index) => (
                     <MenuItem key={index} value={account.index}>
                       {account.name} ({account.email})
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>

             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Recipient Emails"
                 multiline
                 rows={4}
                 value={sendData.recipientEmails}
                 onChange={handleRecipientEmailsChange}
                 placeholder="Enter emails separated by commas (e.g., email1@example.com, email2@example.com)"
                 helperText={`${parseRecipientEmails().length} emails entered`}
               />
             </Grid>
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
           <Button 
             onClick={handleSendEmail} 
             variant="contained" 
             disabled={loading}
             startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
             sx={{ 
               backgroundColor: '#000', 
               color: '#fff',
               '&:hover': {
                 backgroundColor: '#333'
               }
             }}
           >
             {loading ? 'Sending...' : 'Send Email'}
           </Button>
         </DialogActions>
       </Dialog>

       {/* Send Results Dialog */}
       <Dialog open={resultsOpen} onClose={() => setResultsOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Email Send Results</DialogTitle>
         <DialogContent>
           {sendResults && (
             <Box>
               <Box display="flex" alignItems="center" gap={2} mb={2}>
                 <Chip
                   icon={<CheckCircleIcon />}
                   label={`${sendResults.successful} Successful`}
                   color="success"
                 />
                 <Chip
                   icon={<ErrorIcon />}
                   label={`${sendResults.failed} Failed`}
                   color="error"
                 />
               </Box>
               
               {sendResults.successfulEmails && sendResults.successfulEmails.length > 0 && (
                 <Box mb={2}>
                   <Typography variant="subtitle2" gutterBottom>
                     Successful Emails:
                   </Typography>
                   <List dense>
                     {sendResults.successfulEmails.map((email, index) => (
                       <ListItem key={index}>
                         <ListItemIcon>
                           <CheckCircleIcon color="success" />
                         </ListItemIcon>
                         <ListItemText primary={email} />
                       </ListItem>
                     ))}
                   </List>
                 </Box>
               )}
               
               {sendResults.failedEmails && sendResults.failedEmails.length > 0 && (
                 <Box>
                   <Typography variant="subtitle2" gutterBottom>
                     Failed Emails:
                   </Typography>
                   <List dense>
                     {sendResults.failedEmails.map((email, index) => (
                       <ListItem key={index}>
                         <ListItemIcon>
                           <ErrorIcon color="error" />
                         </ListItemIcon>
                         <ListItemText primary={email} />
                       </ListItem>
                     ))}
                   </List>
                 </Box>
               )}
             </Box>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setResultsOpen(false)}>Close</Button>
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default CustomEmail;
