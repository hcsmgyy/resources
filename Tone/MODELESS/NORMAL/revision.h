#ifndef __REVISION_H__
#define __REVISION_H__

#define MOD_VERSION  "1.0.0.10" 
/*********************************************
*  New version	：1.0.0.10
*  Old version	：1.0.0.9
*  Author		：Zalman/Andy
*  Date			：2017.08.10
*  Issue		：1099 【inprice】R50 50.175.6.108版本新增功能：关于通过http发包通知话机执行xml browser功能，需求增加两个需求点
*  Tasks		：
*  Demand		：
*  Reason		：xml中的beep属性实现可配置响铃时间。
*  Modified		：因原来的beep为DTMF_A，playtone来实现,新增tone作为beep声。beep声默认值为Custom=697(-120)+1633(-120)
*  Module		：tone
**********************************************/
/*********************************************
*  New version	：1.0.0.9
*  Old version	：1.0.0.8
*  Author	：andy
*  Date		：2017.3.18
*  Issue	：
*  Task		：
*  Demand 	：
*  Reason	：
*  Modified	：参考文档修改国家信号音
*  Module	：
**********************************************/
  /*********************************************
*  New Version: 1.0.0.8
*  Old Version: 1.0.0.7
*  Author     : Zalman/Will
*  CommitType : 需求修改
*  Date       : 2016/10/25
*  Reason     : 3433 【Alvaco】5x 6x话机在有第三路来电时，只嘟一声
*  Modified   : 增加ALVACO tone资源文件
*  Issue      : zentao Task#3433
*  Affected   : 间隔十秒响一次
 ****************************************************/
/*************************************************************
*  New Version：1.0.0.7
*  Old Version：1.0.0.6
*  Author     ：Jeffrey/Lynn
*  CommitType  : 客户需求
*  Date		   : 2016/05/10
*  Reason：	   : 401 【Akuvox】R59G 美国fastdevice 增加美国的dial tone
*  Modified    : 新增American.conf的Tone音
*  Issue	   :  
*  Affected	   : 
**********************************************/
/*************************************************************
*  New Version：1.0.0.6
*  Old Version：1.0.0.5
*  Author     ：Zalman/Andy
*  CommitType  : 需求修改 bugfree#7373
*  Date		   : 2016/01/05
*  Reason：	   : 【VOIPON】需求：增加英国ringtone，1.增加配置文件中的项；2.增加相应国家tone音文件。
*  Modified    : 每个路径下加入ToneList.conf文件。确认其需要国家音文件列表
*  Issue	   :  
*  Affected	   : 
**********************************************/
/*************************************************************
 *  Old Version：1.0.0.3
 *  New Version：1.0.0.4
 *  Author     ：Andy
 *  CommitType : Bug修改
 *  Date       ：2015/12/27
 *  Reason     ： 
 *  Modified   : 修改TONE Span.conf中的call waiting描述
 *  Issue      : 137 【Alvaco】call waiting ringtone问题
 *  Affected   : 无
 ************************************************************/
/*************************************************************
*  New Version：1.0.0.5
*  Old Version：1.0.0.4
*  Author     ：Zalman/Andy
*  CommitType  : 需求修改 bugfree#7373
*  Date		   : 2015/12/31
*  Reason：	   : 【VOIPON】需求：增加英国ringtone，1.增加配置文件中的项；2.增加相应国家tone音文件。
*  Modified    : 增加英国国家音文件。主要根据需求修改ringback参数和其他几个可查的英国tone音参数，剩余的与默认的一样
*  Issue	   :  
*  Affected	   : 
**********************************************/
/*************************************************************
 *  Old Version：1.0.0.3
 *  New Version：1.0.0.4
 *  Author     ：Andy
 *  CommitType : Bug修改
 *  Date       ：2015/12/27
 *  Reason     ： 
 *  Modified   : 修改TONE Span.conf中的call waiting描述
 *  Issue      : 137 【Alvaco】call waiting ringtone问题
 *  Affected   : 无
 ************************************************************/
/*************************************************************
*  New version  : 1.0.0.3
*  Old version  : 1.0.0.2
*  Modifier     : Jame
*  Date         : 2015/05/20
*  Reason       : 
*  Modification : 增加支持意大利
*  Compile Def  : 
*************************************************************/
/*************************************************************
*  New version  : 1.0.0.2
*  Old version  : 1.0.0.1
*  Modifier     : shaowei.chen
*  Date         : 2014/01/20
*  Reason       : 
*  Modification : (1)修改DTMF的duration = 100
*  Compile Def  : 
*************************************************************/
/*************************************************************
*  New version  : 1.0.0.1
*  Old version  : 1.0.0.0
*  Modifier     : shaowei.chen
*  Date         : 2013/03/11
*  Reason       : 
*  Modification : (1)根据标准修改各个国家信号音
*  Compile Def  : 
*************************************************************/
/*************************************************************
*  New version  : 1.0.0.0
*  Old version  : 1.0.0.0
*  Modifier     : shaowei.chen
*  Date         : 2013/01/30
*  Reason       : 
*  Modification : (1)提交第一个版本支持中国、法国、德国、英国、新西兰等十几个国家
*  Compile Def  : 
*************************************************************/



#define MOD_NAME    "Tone"




#ifdef __cplusplus
extern "C" {
#endif




#ifdef __cplusplus
}
#endif

#endif
