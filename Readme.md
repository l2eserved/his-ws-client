
ระบบ HIS CLIENT DATA HUB  && PHICHIT PPHO TEAM

โปรแกรมที่ต้องการ node js
https://nodejs.org/en/download

วิธีติดตั้ง
1. cd dir ที่ต้องการ
2. git clone https://github.com/l2eserved/his-ws-client
3. cd his-ws-client
4. npm install -i

การตั้งค่าไฟล์ .env

[WebSocket]
ws_server=ws://onesocket.tphcp.go.th #ที่อยู่ของ Websocket Server
email=								 #ที่อยู่ของ login email และ password ที่สร้างบน firebase
password=

[HIS Database]
dbhost=192.168.0.					# Hosxp DB IP
dbport=3306							# Hosxp DB PORT
dbname=hos							# Hosxp DB NAME
dbuser=								# Hosxp DB USER
dbpass=								# Hosxp DB PASS
dbcharset=TIS620					# Hosxp DB CHARSET

การสั่งทำงาน
1. node start.js





MIT License

Copyright (c) [2025] [Theerapong Pakham || l2eserved || HIS CLIENT DATA HUB  && PHICHIT PPHO TEAM]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is provided to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


สัญญาอนุญาตแบบ MIT

ลิขสิทธิ์ (c) [2568] [Theerapong Pakham || l2eserved || HIS CLIENT DATA HUB  && PHICHIT PPHO TEAM]

ขออนุญาตให้ใช้ซอฟต์แวร์นี้ได้โดยไม่คิดค่าใช้จ่าย ให้กับบุคคลใดก็ตามที่ได้รับสำเนาของซอฟต์แวร์และไฟล์เอกสารที่เกี่ยวข้อง (ต่อไปนี้เรียกว่า "ซอฟต์แวร์") สามารถทำการใช้งานซอฟต์แวร์ได้โดยไม่มีข้อจำกัด รวมถึงแต่ไม่จำกัดเพียงการใช้, คัดลอก, แก้ไข, รวม, เผยแพร่, แจกจ่าย, ใบอนุญาตย่อย และ/หรือ ขายสำเนาของซอฟต์แวร์ รวมถึงอนุญาตให้บุคคลที่ได้รับซอฟต์แวร์สามารถทำได้ตามข้อกำหนดเหล่านี้

ข้อความลิขสิทธิ์ข้างต้นและข้อความอนุญาตนี้จะต้องรวมอยู่ในสำเนาทั้งหมดหรือส่วนสำคัญของซอฟต์แวร์

ซอฟต์แวร์นี้มีให้ใช้งาน "ตามสภาพ" โดยไม่มีการรับประกันใด ๆ ทั้งสิ้น ไม่ว่าจะเป็นการรับประกันที่ชัดแจ้งหรือโดยนัย รวมถึงแต่ไม่จำกัดเพียงการรับประกันด้านความสามารถในการขาย, ความเหมาะสมกับวัตถุประสงค์ที่เฉพาะเจาะจง หรือการไม่ละเมิดลิขสิทธิ์ ในกรณีใด ๆ ผู้เขียนหรือเจ้าของลิขสิทธิ์จะไม่รับผิดชอบต่อข้อเรียกร้อง, ความเสียหาย หรือความรับผิดใด ๆ ไม่ว่าจะเป็นการดำเนินการตามสัญญา, การละเมิด, หรือการกระทำอื่นใดที่เกิดจาก, หรือเกี่ยวข้องกับซอฟต์แวร์หรือการใช้งานซอฟต์แวร์นี้
