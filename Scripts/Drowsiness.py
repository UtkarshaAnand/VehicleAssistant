import cv2

face_cascade = cv2.CascadeClassifier('D:/Rishu/VehicleAssistant/Scripts/Dataset/haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier('D:/Rishu/VehicleAssistant/Scripts/Dataset/haarcascade_eye.xml')

def detect(gray, frame):
    faces = face_cascade.detectMultiScale(gray, 1.3, 4)
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x,y), (x+w, y+h), (255, 255, 255), 2)
        
        frame_tmp = frame[faces[0][1]:faces[0][1] + faces[0][3], faces[0][0]:faces[0][0] + faces[0][2]:1, :]
        gray = gray[faces[0][1]:faces[0][1] + faces[0][3], faces[0][0]:faces[0][0] + faces[0][2]:1]
        
        eyes = eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30,30))
        
        value = ""
        if len(eyes) < 2:
            value += "Sleepy"
            #print("Sleepy")
        else:
            value += "Open"
            #print("Open")

        frame_tmp = cv2.resize(frame_tmp, (400, 400), interpolation=cv2.INTER_LINEAR)

        org = (50, 50)
        font = cv2.FONT_HERSHEY_SIMPLEX
        fontScale = 1
        color = (255, 255, 255)
        thickness = 2
        frame = cv2.putText(frame, value, org, font, fontScale, color)
    return (frame)

video_capture = cv2.VideoCapture(0)
while True:
    _, frame = video_capture.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    canvas = detect(gray, frame)
    cv2.imshow('Video', canvas)
    if(cv2.waitKey(1) & 0xFF == ord('q')):
        break
video_capture.release()
cv2.destroyAllWindows()
