# HIS CLIENT DATA HUB & PHICHIT PPHO TEAM

## ความต้องการของระบบ
- [Node.js](https://nodejs.org/en/download) (จำเป็นต้องติดตั้งก่อนใช้งาน)

## วิธีติดตั้ง
```sh
# เข้าไปยังไดเรกทอรีที่ต้องการติดตั้ง
cd /path/to/directory

# Clone โค้ดจาก GitHub
git clone https://github.com/l2eserved/his-ws-client
cd his-ws-client

# ติดตั้ง dependencies
npm install
```

---

## การตั้งค่าไฟล์ `.env`
สร้างไฟล์ `.env` แล้วกำหนดค่าต่อไปนี้:

### **WebSocket Configuration**
```ini
ws_server=ws://onesocket.tphcp.go.th  # ที่อยู่ของ WebSocket Server
email=                                # อีเมลที่ใช้สำหรับล็อกอิน Firebase
password=                             # รหัสผ่านที่ใช้สำหรับล็อกอิน Firebase
```

### **HIS Database Configuration**
```ini
dbhost=192.168.0.XX    # IP ของ Hosxp DB
dbport=3306            # พอร์ตของ Hosxp DB
dbname=hos             # ชื่อฐานข้อมูล Hosxp
dbuser=                # ชื่อผู้ใช้ฐานข้อมูล
dbpass=                # รหัสผ่านฐานข้อมูล
dbcharset=TIS620       # Charset ของฐานข้อมูล
```

---

## วิธีการใช้งาน
```sh
node start.js
```

---

## License - MIT
### English Version
```
MIT License

Copyright (c) 2025 Theerapong Pakham || l2eserved || HIS CLIENT DATA HUB & PHICHIT PPHO TEAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is provided to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### เวอร์ชันภาษาไทย
```
สัญญาอนุญาตแบบ MIT

ลิขสิทธิ์ (c) 2568 Theerapong Pakham || l2eserved || HIS CLIENT DATA HUB & PHICHIT PPHO TEAM

ขออนุญาตให้ใช้ซอฟต์แวร์นี้ได้โดยไม่คิดค่าใช้จ่าย ให้กับบุคคลใดก็ตามที่ได้รับสำเนาของซอฟต์แวร์และไฟล์เอกสารที่เกี่ยวข้อง (ต่อไปนี้เรียกว่า "ซอฟต์แวร์") สามารถทำการใช้งานซอฟต์แวร์ได้โดยไม่มีข้อจำกัด รวมถึงแต่ไม่จำกัดเพียงการใช้, คัดลอก, แก้ไข, รวม, เผยแพร่, แจกจ่าย, ใบอนุญาตย่อย และ/หรือ ขายสำเนาของซอฟต์แวร์ รวมถึงอนุญาตให้บุคคลที่ได้รับซอฟต์แวร์สามารถทำได้ตามข้อกำหนดเหล่านี้

ข้อความลิขสิทธิ์ข้างต้นและข้อความอนุญาตนี้จะต้องรวมอยู่ในสำเนาทั้งหมดหรือส่วนสำคัญของซอฟต์แวร์

ซอฟต์แวร์นี้มีให้ใช้งาน "ตามสภาพ" โดยไม่มีการรับประกันใด ๆ ทั้งสิ้น ไม่ว่าจะเป็นการรับประกันที่ชัดแจ้งหรือโดยนัย รวมถึงแต่ไม่จำกัดเพียงการรับประกันด้านความสามารถในการขาย, ความเหมาะสมกับวัตถุประสงค์ที่เฉพาะเจาะจง หรือการไม่ละเมิดลิขสิทธิ์ ในกรณีใด ๆ ผู้เขียนหรือเจ้าของลิขสิทธิ์จะไม่รับผิดชอบต่อข้อเรียกร้อง, ความเสียหาย หรือความรับผิดใด ๆ ไม่ว่าจะเป็นการดำเนินการตามสัญญา, การละเมิด, หรือการกระทำอื่นใดที่เกิดจาก, หรือเกี่ยวข้องกับซอฟต์แวร์หรือการใช้งานซอฟต์แวร์นี้
```

---

**Contact & Support:**
📧 ติดต่อ: Theerapong Pakham

