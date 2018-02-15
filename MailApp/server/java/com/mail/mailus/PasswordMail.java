package com.mail.mailus;
import java.util.Date;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
	public class PasswordMail {
		public PasswordMail() {
		}
				public boolean sendMail(String to,String msgs,String s) throws MessagingException
		{
			String host="smtp.gmail.com";
String username="bparmar360@gmail.com";
			String password="04061997";
			String subject=s;
String body = msgs;
	 Properties properties = new Properties();
     properties.put("mail.smtp.host", host);
     properties.put("mail.smtp.port", "587");
     properties.put("mail.smtp.auth", "true");
     properties.put("mail.smtp.starttls.enable", "true");
     properties.put("mail.smtp.ssl.trust", "smtp.gmail.com");
     properties.put("mail.smtp.user", username);
     Session session = Session.getDefaultInstance(properties);
     Message msg = new MimeMessage(session);
     msg.setFrom(new InternetAddress(username));
     InternetAddress[] toAddresses = { new InternetAddress(to) };
     msg.setRecipients(Message.RecipientType.TO, toAddresses);
     msg.setSubject(subject);
     msg.setSentDate(new Date());
     msg.setText(body);
     Transport t = session.getTransport("smtp");
     t.connect(username, password);
     t.sendMessage(msg, msg.getAllRecipients());
     t.close();
			return true;
		}
				public boolean sendM(String to, String msg, String subject){
					
					return false;
				}
	}
	